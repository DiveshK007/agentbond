#!/usr/bin/env ts-node
/**
 * list-jobs.ts
 *
 * Print a live summary of all jobs on the protocol.
 * Run from the bots/ directory:
 *   cd bots && npx ts-node ../scripts/list-jobs.ts
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
try { require("dotenv").config(); } catch { /* no .env */ }

import { Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { AgentBondClient } from "../sdk/src/client";

const RPC_URL = process.env["RPC_URL"] ?? "https://api.devnet.solana.com";
const STATUS = ["Open", "Assigned", "Submitted", "Completed", "Disputed", "Cancelled", "Timed Out"];

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");
  const client = new AgentBondClient(connection, new Wallet(Keypair.generate()));

  const [stats, jobs, agents] = await Promise.all([
    client.getProtocolStats(),
    client.getAllJobs(),
    client.getAllAgents(),
  ]);

  const agentNames = new Map(agents.map((a) => [a.owner.toBase58(), a.name]));

  process.stdout.write("\n=== AgentBond Protocol ===\n");
  process.stdout.write(`Agents: ${stats.totalAgents}  Jobs: ${stats.totalJobs}\n\n`);

  if (jobs.length === 0) {
    process.stdout.write("No jobs yet. Run the seed script to add some.\n");
    return;
  }

  for (const job of jobs.sort((a, b) => Number(a.jobIndex) - Number(b.jobIndex))) {
    const reward = (Number(job.reward) / 1e9).toFixed(4);
    const statusStr = STATUS[job.status] ?? "Unknown";
    const agentName = agentNames.get(job.agent.toBase58()) ?? job.agent.toBase58().slice(0, 8) + "…";
    const hasAgent = job.agent.toBase58() !== "11111111111111111111111111111111";

    process.stdout.write(
      `#${String(job.jobIndex).padEnd(3)} ${statusStr.padEnd(12)} ${reward} ◎  ${hasAgent ? agentName : "(unassigned)"}\n`
    );
  }

  const completed = jobs.filter((j) => j.status === 3).length;
  const disputed = jobs.filter((j) => j.status === 4).length;
  const open = jobs.filter((j) => j.status === 0).length;
  process.stdout.write(`\nOpen: ${open}  Completed: ${completed}  Disputed/Slashed: ${disputed}\n`);
}

main().catch((err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
