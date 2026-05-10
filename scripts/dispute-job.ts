#!/usr/bin/env ts-node
/**
 * dispute-job.ts
 *
 * Dispute a job (triggering on-chain slashing of the agent's stake).
 * Use this after FailBot submits a garbage result.
 *
 * Usage (from bots/ directory so deps resolve):
 *   cd bots
 *   KEYPAIR_PATH=~/.config/agentbond/keys/poster.json \
 *   npx ts-node ../scripts/dispute-job.ts <job-index>
 *
 * Example:
 *   KEYPAIR_PATH=~/.config/agentbond/keys/poster.json \
 *   npx ts-node ../scripts/dispute-job.ts 3
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
  const kpPath =
    process.env["KEYPAIR_PATH"] ??
    `${homedir()}/.config/solana/id.json`;
  const raw = JSON.parse(readFileSync(kpPath, "utf8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

async function main() {
  const jobIndexArg = process.argv[2];
  if (!jobIndexArg) {
    process.stderr.write("Usage: npx ts-node scripts/dispute-job.ts <job-index>\n");
    process.exit(1);
  }

  const jobIndex = parseInt(jobIndexArg);
  if (isNaN(jobIndex) || jobIndex < 0) {
    process.stderr.write(`Invalid job index: ${jobIndexArg}\n`);
    process.exit(1);
  }

  const keypair = loadKeypair();
  const connection = new Connection(RPC_URL, "confirmed");
  const client = new AgentBondClient(connection, new Wallet(keypair));

  const [jobPda] = findJob(BigInt(jobIndex));

  process.stdout.write(`\nDisputing job #${jobIndex}...\n`);
  process.stdout.write(`Poster: ${keypair.publicKey.toBase58()}\n`);
  process.stdout.write(`Job PDA: ${jobPda.toBase58()}\n\n`);

  // Fetch job first to show current state
  try {
    const job = await client.getJob(BigInt(jobIndex));
    const reward = (Number(job.reward) / 1e9).toFixed(4);
    const STATUS = ["Open", "Assigned", "Submitted", "Completed", "Disputed", "Cancelled", "Timed Out"];
    process.stdout.write(`Current status: ${STATUS[job.status] ?? job.status}\n`);
    process.stdout.write(`Reward at stake: ${reward} SOL\n\n`);

    if (job.status !== 2) {
      process.stderr.write(`Job #${jobIndex} is not in Submitted state (status: ${job.status}).\n`);
      process.stderr.write("Wait for FailBot to submit a result first.\n");
      process.exit(1);
    }
  } catch (e) {
    process.stderr.write(`Could not fetch job: ${e instanceof Error ? e.message : String(e)}\n`);
    process.exit(1);
  }

  const tx = await client.disputeJob(jobPda);

  process.stdout.write(`✓ Dispute transaction: ${tx}\n`);
  process.stdout.write(`\n🔗 View on Solana Explorer:\n`);
  process.stdout.write(`   https://explorer.solana.com/tx/${tx}?cluster=devnet\n\n`);
  process.stdout.write(`⚡ FailBot's stake has been slashed. Reward refunded to poster.\n`);
  process.stdout.write(`   This transaction URL is your money shot — put it in your pitch video.\n`);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
