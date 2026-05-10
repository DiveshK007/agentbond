#!/usr/bin/env ts-node
/**
 * seed-demo.ts
 *
 * Populates AgentBond devnet with realistic demo activity:
 *   1. Register N demo agents with staked SOL
 *   2. Post M jobs at varying reward levels
 *   3. Agents bid, poster assigns, agents submit results, poster approves
 *   4. One agent (FailBot) gets disputed — triggers on-chain slashing
 *
 * Run from repo root:
 *   npx ts-node scripts/seed-demo.ts
 *
 * Devnet SOL is free. Each run takes ~3 minutes due to Solana confirmation times.
 */

// Run from bots/ or ensure dotenv is in your PATH:
//   cd bots && npx ts-node ../scripts/seed-demo.ts
// eslint-disable-next-line @typescript-eslint/no-require-imports
try { require("dotenv").config(); } catch { /* no .env — env vars used as-is */ }
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../sdk/src/client";
import { findJob, findAgentProfile } from "../sdk/src/utils";
import { createHash } from "crypto";

const RPC_URL = process.env["RPC_URL"] ?? "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

function log(msg: string) {
  process.stdout.write(`[seed] ${msg}\n`);
}

async function airdrop(pubkey: PublicKey, sol: number) {
  try {
    const sig = await connection.requestAirdrop(pubkey, sol * LAMPORTS_PER_SOL);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
    log(`  Airdropped ${sol} SOL → ${pubkey.toBase58().slice(0, 8)}…`);
  } catch (e) {
    log(`  Airdrop failed for ${pubkey.toBase58().slice(0, 8)}… (may already be funded): ${e instanceof Error ? e.message : String(e)}`);
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function sha256(text: string): Uint8Array {
  return new Uint8Array(createHash("sha256").update(text).digest());
}

// ─── Demo Roster ──────────────────────────────────────────────────────────────

const DEMO_AGENTS: { name: string; stake: number; metadataUri: string }[] = [
  { name: "PriceBot-Alpha",           stake: 0.5, metadataUri: "https://agentbond.io/agents/pricebot-alpha" },
  { name: "SwapBot-Pro",              stake: 0.8, metadataUri: "https://agentbond.io/agents/swapbot-pro" },
  { name: "PortfolioBot-v2",          stake: 0.6, metadataUri: "https://agentbond.io/agents/portfoliobot-v2" },
  { name: "CrossChainBot",            stake: 1.0, metadataUri: "https://agentbond.io/agents/crosschainbot" },
  { name: "OracleBot-Switchboard",    stake: 0.4, metadataUri: "https://agentbond.io/agents/oraclebot" },
  { name: "FailBot-Demo",             stake: 0.3, metadataUri: "https://agentbond.io/agents/failbot-demo" },
];

const DEMO_JOBS: { description: string; reward: number }[] = [
  { description: "Fetch current SOL/USD price from Switchboard oracle and return JSON", reward: 0.01 },
  { description: "Execute Jupiter swap: 0.1 SOL → USDC at best available route", reward: 0.05 },
  { description: "Analyze portfolio for wallet GDxEk1KB... and return total USD value", reward: 0.02 },
  { description: "Bridge 0.05 SOL from Solana to Ethereum via LI.FI best route", reward: 0.08 },
  { description: "Monitor Helius webhook stream for SPL token transfer events 10min", reward: 0.015 },
  { description: "Fetch 7-day price history for SOL, BONK, JUP and return CSV", reward: 0.025 },
  { description: "Submit result for confidential token swap via Swig wallet", reward: 0.06 },
  { description: "Register Metaplex NFT badge for agent with capability: price_oracle", reward: 0.03 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log("AgentBond Demo Seed — Solana Devnet");
  log(`RPC: ${RPC_URL}`);
  log("─".repeat(55));

  const agentKeypairs = DEMO_AGENTS.map(() => Keypair.generate());
  const posterKeypair = Keypair.generate();

  // ─── Fund wallets ──────────────────────────────────────────────────────────

  log(`\nFunding ${agentKeypairs.length} agent wallets + poster wallet via devnet airdrop…`);
  for (let i = 0; i < agentKeypairs.length; i++) {
    await airdrop(agentKeypairs[i]!.publicKey, DEMO_AGENTS[i]!.stake + 0.25);
    await sleep(400);
  }
  await airdrop(posterKeypair.publicKey, 2.5);
  await sleep(400);

  // ─── Register agents ──────────────────────────────────────────────────────

  log("\nRegistering demo agents on-chain…");
  const agentClients: AgentBondClient[] = [];

  for (let i = 0; i < DEMO_AGENTS.length; i++) {
    const kp = agentKeypairs[i]!;
    const agent = DEMO_AGENTS[i]!;
    const sdkClient = new AgentBondClient(connection, new Wallet(kp));
    agentClients.push(sdkClient);

    try {
      await sdkClient.registerAgent(
        agent.name,
        agent.metadataUri,
        BigInt(Math.round(agent.stake * LAMPORTS_PER_SOL))
      );
      log(`  ✓ ${agent.name} registered  (${agent.stake} SOL staked)`);
    } catch (e) {
      log(`  ✗ ${agent.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
    await sleep(1000);
  }

  // ─── Post jobs ────────────────────────────────────────────────────────────

  log("\nPosting demo jobs with escrowed rewards…");
  const posterClient = new AgentBondClient(connection, new Wallet(posterKeypair));
  const jobDescriptions: string[] = [];

  for (const job of DEMO_JOBS) {
    jobDescriptions.push(job.description);
    try {
      await posterClient.postJob(
        sha256(job.description),
        BigInt(Math.round(job.reward * LAMPORTS_PER_SOL)),
        BigInt(7200) // 2 hour deadline
      );
      log(`  ✓ Posted: "${job.description.slice(0, 52)}…"  (${job.reward} ◎)`);
    } catch (e) {
      log(`  ✗ Failed to post: ${e instanceof Error ? e.message : String(e)}`);
    }
    await sleep(800);
  }

  // ─── Bid, assign, execute ─────────────────────────────────────────────────

  log("\nSimulating agent bids → assignments → completions…");

  const stats = await posterClient.getProtocolStats();
  const totalJobs = Number(stats.totalJobs);
  const firstNewJob = Math.max(0, totalJobs - DEMO_JOBS.length);

  const regularAgents = agentClients.slice(0, 5); // exclude FailBot
  const failBot = agentClients[5]!;

  for (let i = firstNewJob; i < totalJobs; i++) {
    const relIdx = i - firstNewJob;
    // FailBot takes every 4th job (for slashing demo)
    const useFailBot = relIdx % 4 === 3;
    const workerClient = useFailBot ? failBot : regularAgents[relIdx % regularAgents.length]!;
    const workerName = useFailBot
      ? "FailBot-Demo"
      : DEMO_AGENTS[relIdx % regularAgents.length]!.name;

    const [jobPda] = findJob(BigInt(i));

    try {
      // 1. Agent bids
      const rewardLamports = BigInt(
        Math.round(DEMO_JOBS[relIdx % DEMO_JOBS.length]!.reward * LAMPORTS_PER_SOL)
      );
      await workerClient.bidOnJob(jobPda, rewardLamports, 1800);
      log(`  ✓ ${workerName} bid on job #${i}`);
      await sleep(500);

      // 2. Poster assigns
      await posterClient.assignAgent(jobPda, workerClient.walletPublicKey);
      log(`    Assigned → ${workerName}`);
      await sleep(500);

      if (useFailBot) {
        // Poster disputes immediately (FailBot "failed" the job)
        await posterClient.disputeJob(jobPda);
        log(`    ⚡ Job #${i} disputed — ${workerName} stake SLASHED`);
      } else {
        // 3. Agent submits result
        const resultHash = sha256(`result:job${i}:${workerName}:${Date.now()}`);
        await workerClient.submitResult(jobPda, resultHash);
        log(`    Result submitted`);
        await sleep(400);

        // 4. Poster approves → reward released
        await posterClient.approveJob(jobPda);
        log(`    ✓ Job #${i} complete — ${workerName} earned reward`);
      }
    } catch (e) {
      log(`  ✗ Job #${i} error: ${e instanceof Error ? e.message : String(e)}`);
    }

    await sleep(700);
  }

  // ─── Final summary ────────────────────────────────────────────────────────

  log("\n" + "─".repeat(55));
  log("Seed complete!");

  try {
    const finalStats = await posterClient.getProtocolStats();
    log(`  Registered agents : ${finalStats.totalAgents}`);
    log(`  Total jobs        : ${finalStats.totalJobs}`);
  } catch {
    log("  (Could not fetch final stats)");
  }

  log("\nView results:");
  log("  http://localhost:3000/leaderboard");
  log("  http://localhost:3000/agents");
  log("  http://localhost:3000/jobs");
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
