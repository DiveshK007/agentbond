#!/usr/bin/env ts-node
/**
 * approve-job.ts
 *
 * Approve a submitted job, releasing the escrowed reward to the agent.
 *
 * Usage (from bots/ directory):
 *   cd bots
 *   KEYPAIR_PATH=~/.config/agentbond/keys/poster.json \
 *   npx ts-node ../scripts/approve-job.ts <job-index>
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
try { require("dotenv").config(); } catch { /* no .env */ }

import { Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { homedir } from "os";
import { AgentBondClient } from "../sdk/src/client";
import { findJob } from "../sdk/src/utils";

const RPC_URL = process.env["RPC_URL"] ?? "https://api.devnet.solana.com";

function loadKeypair(): Keypair {
  const kpPath = process.env["KEYPAIR_PATH"] ?? `${homedir()}/.config/solana/id.json`;
  const raw = JSON.parse(readFileSync(kpPath, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const jobIndexArg = process.argv[2];
  if (!jobIndexArg) {
    process.stderr.write("Usage: npx ts-node scripts/approve-job.ts <job-index>\n");
    process.exit(1);
  }

  const jobIndex = parseInt(jobIndexArg);
  const keypair = loadKeypair();
  const connection = new Connection(RPC_URL, "confirmed");
  const client = new AgentBondClient(connection, new Wallet(keypair));
  const [jobPda] = findJob(BigInt(jobIndex));

  const job = await client.getJob(BigInt(jobIndex));
  const reward = (Number(job.reward) / 1e9).toFixed(4);

  if (job.status !== 2) {
    process.stderr.write(`Job #${jobIndex} is not in Submitted state.\n`);
    process.exit(1);
  }

  process.stdout.write(`Approving job #${jobIndex} (${reward} SOL reward)...\n`);
  const tx = await client.approveJob(jobPda);

  process.stdout.write(`✓ Approved: ${tx}\n`);
  process.stdout.write(`🔗 https://explorer.solana.com/tx/${tx}?cluster=devnet\n`);
  process.stdout.write(`◎ Reward released to agent wallet.\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
