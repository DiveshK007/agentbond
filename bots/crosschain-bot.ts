import "dotenv/config";
import fetch from "node-fetch";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";

const SOL = 1_000_000_000n;

/**
 * CrossChainBot — executes cross-chain swaps via LI.FI's aggregation API.
 *
 * Supports 58+ chains, 27+ bridges, and 31+ DEXes.
 * Uses the LI.FI REST API directly for maximum compatibility.
 *
 * Job description expected format (via metadata API):
 * {
 *   "action": "cross_chain_swap",
 *   "fromChainId": 1151111081099710,  // Solana
 *   "toChainId": 1,                   // Ethereum
 *   "fromToken": "So11111111111111111111111111111111111111112",
 *   "toToken": "0x0000000000000000000000000000000000000000",
 *   "amount": "10000000",
 *   "fromAddress": "..."
 * }
 */

const LIFI_API = "https://li.quest/v1";

class CrossChainBot extends BaseBot {
  constructor() {
    super("CrossChainBot", "cross_chain_swap", SOL, 75_000n, "swap");
  }

  async executeJob(job: Job): Promise<string> {
    // Default: Solana SOL → Ethereum ETH quote
    let fromChainId = 1151111081099710; // Solana
    let toChainId = 1; // Ethereum
    let fromToken = "So11111111111111111111111111111111111111112";
    let toToken = "0x0000000000000000000000000000000000000000"; // Native ETH
    let amount = "10000000"; // 0.01 SOL
    let fromAddress = this.walletPublicKey.toBase58();

    // Try to parse job params from metadata API
    try {
      const API_BASE = process.env.API_URL || "http://localhost:3001";
      const descHash = Buffer.from(job.descriptionHash).toString("hex");
      const metaRes = await fetch(`${API_BASE}/api/metadata/job/${descHash}`);
      if (metaRes.ok) {
        const meta = (await metaRes.json()) as {
          fromChainId?: number;
          toChainId?: number;
          fromToken?: string;
          toToken?: string;
          amount?: string;
          fromAddress?: string;
        };
        if (meta.fromChainId) fromChainId = meta.fromChainId;
        if (meta.toChainId) toChainId = meta.toChainId;
        if (meta.fromToken) fromToken = meta.fromToken;
        if (meta.toToken) toToken = meta.toToken;
        if (meta.amount) amount = meta.amount;
        if (meta.fromAddress) fromAddress = meta.fromAddress;
      }
    } catch {
      this.log("Could not fetch job metadata, using defaults");
    }

    this.log(
      `Fetching LI.FI quote: chain ${fromChainId} → ${toChainId}, amount ${amount}`
    );

    // Step 1: Get quote from LI.FI
    const quoteUrl = new URL(`${LIFI_API}/quote`);
    quoteUrl.searchParams.set("fromChain", String(fromChainId));
    quoteUrl.searchParams.set("toChain", String(toChainId));
    quoteUrl.searchParams.set("fromToken", fromToken);
    quoteUrl.searchParams.set("toToken", toToken);
    quoteUrl.searchParams.set("fromAmount", amount);
    quoteUrl.searchParams.set("fromAddress", fromAddress);

    const headers: Record<string, string> = {
      accept: "application/json",
    };
    const apiKey = process.env.LIFI_API_KEY;
    if (apiKey) {
      headers["x-lifi-api-key"] = apiKey;
    }

    const quoteRes = await fetch(quoteUrl.toString(), { headers });

    if (!quoteRes.ok) {
      const errText = await quoteRes.text();
      this.log(`LI.FI quote error: ${quoteRes.status} — ${errText}`);

      // Return a quote-only result (no execution) for demo purposes
      return JSON.stringify({
        action: "cross_chain_swap",
        status: "quote_failed",
        fromChainId,
        toChainId,
        fromToken: fromToken.slice(0, 12) + "…",
        toToken: toToken.slice(0, 12) + "…",
        amount,
        error: `LI.FI returned ${quoteRes.status}`,
        timestamp: Date.now(),
        source: "lifi_v1",
      });
    }

    const quote = (await quoteRes.json()) as LiFiQuoteResponse;

    this.log(
      `LI.FI quote received: ${quote.estimate?.fromAmount ?? amount} → ${
        quote.estimate?.toAmount ?? "?"
      } via ${quote.toolDetails?.name ?? "unknown"}`
    );

    // For hackathon demo: return the quote data as the result
    // In production, the bot would sign and broadcast the transactionRequest
    return JSON.stringify({
      action: "cross_chain_swap",
      status: "quoted",
      fromChainId,
      toChainId,
      fromToken: fromToken.slice(0, 12) + "…",
      toToken: toToken.slice(0, 12) + "…",
      inputAmount: quote.estimate?.fromAmount ?? amount,
      outputAmount: quote.estimate?.toAmount ?? "0",
      tool: quote.toolDetails?.name ?? "unknown",
      bridgeUsed: quote.tool ?? "unknown",
      estimatedGas: quote.estimate?.gasCosts?.[0]?.amount ?? "0",
      executionDurationSeconds: quote.estimate?.executionDuration ?? 0,
      timestamp: Date.now(),
      source: "lifi_v1",
    });
  }
}

interface LiFiQuoteResponse {
  estimate?: {
    fromAmount?: string;
    toAmount?: string;
    executionDuration?: number;
    gasCosts?: Array<{ amount?: string }>;
  };
  tool?: string;
  toolDetails?: { name?: string };
  transactionRequest?: unknown;
}

new CrossChainBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
