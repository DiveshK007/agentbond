import { readFileSync } from "fs";
import { homedir } from "os";
import { Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../../sdk/src/client";
import { findJob } from "../../sdk/src/utils";

const DEVNET_RPC = process.env.RPC_URL || "https://api.devnet.solana.com";

async function main(): Promise<void> {
  const keypairPath = `${homedir()}/.config/solana/apex-bot-devnet.json`;
  const raw = JSON.parse(readFileSync(keypairPath, "utf8")) as number[];
  const keypair = Keypair.fromSecretKey(Uint8Array.from(raw));

  const connection = new Connection(DEVNET_RPC, "confirmed");
  const wallet = new Wallet(keypair);
  const client = new AgentBondClient(connection, wallet);

  const [jobPda] = findJob(BigInt(1));
  const tx = await client.assignAgent(jobPda, keypair.publicKey);

  console.log("Agent assigned! Tx: " + tx);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
