#!/usr/bin/env ts-node
/**
 * keep-alive.ts
 *
 * Runs hourly via GitHub Actions to keep the AgentBond devnet protocol active.
 *
 * Behavior:
 *   - Loads poster keypair from POSTER_KEYPAIR_JSON env (raw JSON array)
 *   - Posts a small random job (0.005–0.02 SOL reward) to devnet
 *   - The 3 running bots (PriceBot, SwapBot, PortfolioBot) auto-bid within ~30s
 *   - Result: leaderboard and /jobs page stay alive 24/7
 *
 * Env:
 *   POSTER_KEYPAIR_JSON  - raw JSON byte array from poster-bot.json
 *   RPC_URL              - optional, defaults to https://api.devnet.solana.com
 *
 * Run from repo root:
 *   POSTER_KEYPAIR_JSON='[1,2,3,...]' npx ts-node scripts/keep-alive.ts
 */

try { require("dotenv").config(); } catch { /* no .env in CI */ }

import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../sdk/src/client";
import { createHash } from "crypto";

const RPC_URL = process.env["RPC_URL"] ?? "https://api.devnet.solana.com";

const JOB_TEMPLATES = [
  { desc: "Fetch live SOL/USD price", reward: 0.005 },
  { desc: "Get current Jupiter swap rate: SOL→USDC", reward: 0.008 },
  { desc: "Verify Switchboard price feed signature", reward: 0.01 },
  { desc: "Aggregate top-100 wallet activity on Solana", reward: 0.015 },
  { desc: "Cross-chain quote: 0.5 SOL → ETH via LI.FI", reward: 0.012 },
  { desc: "Health check: confirm devnet RPC latency < 200ms", reward: 0.005 },
  { desc: "Compute 24h volume for SOL/USDC on Jupiter", reward: 0.01 },
  { desc: "Snapshot top 10 staked agents on AgentBond", reward: 0.008 },
];

function pickJob() {
  return JOB_TEMPLATES[Math.floor(Math.random() * JOB_TEMPLATES.length)]!;
}

function loadKeypair(): Keypair {
  const raw = process.env["POSTER_KEYPAIR_JSON"];
  if (!raw) {
    throw new Error("POSTER_KEYPAIR_JSON env var is required");
  }
  const bytes = JSON.parse(raw) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(bytes));
}

async function main() {
  const kp = loadKeypair();
  const conn = new Connection(RPC_URL, "confirmed");
  const balance = await conn.getBalance(kp.publicKey);
  console.log(`[keep-alive] Poster: ${kp.publicKey.toBase58()}`);
  console.log(`[keep-alive] Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.error(`[keep-alive] WARNING: balance below 0.05 SOL — protocol may stall. Top up the poster wallet.`);
    process.exit(1);
  }

  const client = new AgentBondClient(conn, new Wallet(kp));
  const job = pickJob();
  const hash = new Uint8Array(
    createHash("sha256")
      .update(`${job.desc} · ${Date.now()}`)
      .digest()
  );

  console.log(`[keep-alive] Posting job: "${job.desc}" — reward ${job.reward} SOL`);
  const tx = await client.postJob(
    hash,
    BigInt(Math.round(job.reward * LAMPORTS_PER_SOL)),
    BigInt(3600)
  );
  console.log(`[keep-alive] ✓ Job posted, tx=${tx}`);
  console.log(`[keep-alive] Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
}

main().catch((err) => {
  console.error(`[keep-alive] FAILED: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
