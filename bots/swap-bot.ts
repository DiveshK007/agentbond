import "dotenv/config";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";
import {
  Connection,
  VersionedTransaction,
} from "@solana/web3.js";
import { createJupiterApiClient } from "@jup-ag/api";

const SOL = 1_000_000_000n;

// Common Solana token mints
const MINTS: Record<string, string> = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
};

const DEVNET_RPC = process.env.RPC_URL || "https://api.devnet.solana.com";

/**
 * SwapBot — executes Jupiter token swaps on behalf of users.
 *
 * Job description JSON expected format:
 * {
 *   "action": "swap",
 *   "inputToken": "SOL",
 *   "outputToken": "USDC",
 *   "amountLamports": 10000000
 * }
 *
 * Falls back to a SOL→USDC quote demonstration if the job description
 * can't be parsed (e.g. hash-only jobs from the demo flow).
 */
class SwapBot extends BaseBot {
  private jupiter = createJupiterApiClient();
  private connection = new Connection(DEVNET_RPC, "confirmed");

  constructor() {
    super("SwapBot", "execute_swap", SOL, 50_000n, "swap");
  }

  async executeJob(job: Job): Promise<string> {
    // Try to parse job params from metadata API
    let inputMint = MINTS.SOL;
    let outputMint = MINTS.USDC;
    let amount = 10_000_000; // 0.01 SOL default

    try {
      const API_BASE = process.env.API_URL || "http://localhost:3001";
      const descHash = Buffer.from(job.descriptionHash).toString("hex");
      const metaRes = await fetch(`${API_BASE}/api/metadata/job/${descHash}`);
      if (metaRes.ok) {
        const meta = (await metaRes.json()) as {
          inputToken?: string;
          outputToken?: string;
          amountLamports?: number;
        };
        if (meta.inputToken && MINTS[meta.inputToken.toUpperCase()]) {
          inputMint = MINTS[meta.inputToken.toUpperCase()];
        }
        if (meta.outputToken && MINTS[meta.outputToken.toUpperCase()]) {
          outputMint = MINTS[meta.outputToken.toUpperCase()];
        }
        if (meta.amountLamports && meta.amountLamports > 0) {
          amount = meta.amountLamports;
        }
      }
    } catch {
      this.log("Could not fetch job metadata, using defaults (SOL→USDC 0.01)");
    }

    this.log(
      `Fetching Jupiter quote: ${amount} lamports, ${inputMint.slice(0, 8)}… → ${outputMint.slice(0, 8)}…`
    );

    // Step 1: Get quote from Jupiter
    const quote = await this.jupiter.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps: 50, // 0.5% slippage
    });

    if (!quote || !quote.outAmount) {
      throw new Error("Jupiter returned no quote");
    }

    this.log(
      `Quote received: ${amount} → ${quote.outAmount} (${quote.routePlan?.length ?? 0} hops)`
    );

    // Step 2: Get swap transaction
    const swapResponse = await this.jupiter.swapPost({
      swapRequest: {
        userPublicKey: this.walletPublicKey.toBase58(),
        quoteResponse: quote,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: {
          autoMultiplier: 2,
        } as never,
      },
    });

    if (!swapResponse || !swapResponse.swapTransaction) {
      throw new Error("Jupiter returned no swap transaction");
    }

    // Step 3: Deserialize, sign and send the transaction
    const txBuf = Buffer.from(swapResponse.swapTransaction, "base64");
    const tx = VersionedTransaction.deserialize(txBuf);

    // The client's provider wallet handles signing
    const signedTx = await this.client.provider.wallet.signTransaction(
      tx as never
    );
    const txSig = await this.connection.sendRawTransaction(
      (signedTx as VersionedTransaction).serialize(),
      { skipPreflight: true }
    );

    this.log(`Swap TX sent: ${txSig}`);

    // Step 4: Wait for confirmation
    const confirmation = await this.connection.confirmTransaction(txSig, "confirmed");

    if (confirmation.value.err) {
      throw new Error(`Swap TX failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    this.log(`Swap confirmed: ${txSig}`);

    // Return the result that gets hashed and submitted on-chain
    return JSON.stringify({
      action: "swap",
      inputMint,
      outputMint,
      inputAmount: amount,
      outputAmount: quote.outAmount,
      txSignature: txSig,
      timestamp: Date.now(),
      source: "jupiter_v6",
    });
  }
}

new SwapBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
