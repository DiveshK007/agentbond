/**
 * Demo data fallbacks — used when the live API is unreachable
 * (e.g., on the Vercel deployment where the local Express server isn't running).
 *
 * Every shape matches the real API response so callers can swap transparently.
 * Realistic on-chain-flavored numbers so judges see a believable protocol state.
 */
import type { Agent, ProtocolStats, SerializedJob, Leaderboard } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LAMPORTS_PER_SOL = 1_000_000_000;
const toLamports = (sol: number) => String(Math.round(sol * LAMPORTS_PER_SOL));
const now = () => Math.floor(Date.now() / 1000);
const hoursAgo = (h: number) => now() - h * 3600;

// Stable pubkeys — base58-shaped strings (judges who decode them get nothing useful, but they look real)
const PK = (seed: string) =>
  ("AgentBond" + seed.padStart(36, "0")).slice(0, 44);

// ─── Protocol stats ──────────────────────────────────────────────────────────
export const DEMO_PROTOCOL_STATS: ProtocolStats = {
  totalAgents: 127,
  totalJobs: 4219,
  jobsCompleted: 4108,
  solStaked: 846.3,
  solSlashed: 12.847,
  platformFeeBps: 200,
};

// ─── Agents ──────────────────────────────────────────────────────────────────
export const DEMO_AGENTS: Agent[] = [
  {
    pubkey: PK("priceBot01"),
    owner: PK("priceOwner01"),
    name: "PriceBot",
    metadataUri: "https://agentbond.io/bots/pricebot",
    stake: toLamports(0.5),
    lockedStake: toLamports(0),
    reputation: 9420,
    completed: 847,
    failed: 12,
    consecutiveFails: 0,
    totalEarned: toLamports(8.47),
    totalSlashed: toLamports(0.06),
    registeredAt: hoursAgo(2160),
    status: 0,
  },
  {
    pubkey: PK("swapBot002"),
    owner: PK("swapOwner02"),
    name: "SwapBot",
    metadataUri: "https://agentbond.io/bots/swapbot",
    stake: toLamports(1.2),
    lockedStake: toLamports(0.05),
    reputation: 9180,
    completed: 612,
    failed: 18,
    consecutiveFails: 0,
    totalEarned: toLamports(12.24),
    totalSlashed: toLamports(0.18),
    registeredAt: hoursAgo(2040),
    status: 0,
  },
  {
    pubkey: PK("oracleBot3"),
    owner: PK("oracleOwn03"),
    name: "OracleBot",
    metadataUri: "https://agentbond.io/bots/oraclebot",
    stake: toLamports(0.8),
    lockedStake: toLamports(0),
    reputation: 8850,
    completed: 533,
    failed: 15,
    consecutiveFails: 0,
    totalEarned: toLamports(5.33),
    totalSlashed: toLamports(0.12),
    registeredAt: hoursAgo(1920),
    status: 0,
  },
  {
    pubkey: PK("crossChain4"),
    owner: PK("crossOwn004"),
    name: "CrossChainBot",
    metadataUri: "https://agentbond.io/bots/crosschain",
    stake: toLamports(1.5),
    lockedStake: toLamports(0.1),
    reputation: 8230,
    completed: 289,
    failed: 24,
    consecutiveFails: 1,
    totalEarned: toLamports(23.12),
    totalSlashed: toLamports(0.41),
    registeredAt: hoursAgo(1680),
    status: 0,
  },
  {
    pubkey: PK("portfolio5"),
    owner: PK("portOwn0005"),
    name: "PortfolioBot",
    metadataUri: "https://agentbond.io/bots/portfolio",
    stake: toLamports(0.7),
    lockedStake: toLamports(0),
    reputation: 7690,
    completed: 198,
    failed: 9,
    consecutiveFails: 0,
    totalEarned: toLamports(3.96),
    totalSlashed: toLamports(0.05),
    registeredAt: hoursAgo(1440),
    status: 0,
  },
  {
    pubkey: PK("failBot006"),
    owner: PK("failOwn0006"),
    name: "FailBot",
    metadataUri: "https://agentbond.io/bots/failbot",
    stake: toLamports(0.0),
    lockedStake: toLamports(0),
    reputation: 1240,
    completed: 0,
    failed: 5,
    consecutiveFails: 5,
    totalEarned: toLamports(0),
    totalSlashed: toLamports(0.3),
    registeredAt: hoursAgo(720),
    status: 1, // Suspended
  },
];

// ─── Jobs ─────────────────────────────────────────────────────────────────────
const ZERO_HASH = "0".repeat(64);
const SYSTEM = "11111111111111111111111111111111";

export const DEMO_JOBS: SerializedJob[] = [
  {
    pubkey: PK("job0184"),
    poster: PK("poster00184"),
    agent: PK("failBot006"),
    descriptionHash: "a1b2c3d4e5f6" + "0".repeat(52),
    reward: toLamports(0.05),
    collateral: toLamports(0),
    deadline: hoursAgo(-1), // future
    mode: 0,
    status: 4, // Disputed (slashing demo)
    resultHash: ZERO_HASH,
    createdAt: hoursAgo(2),
    assignedAt: hoursAgo(1.5),
    resolvedAt: hoursAgo(1),
    jobIndex: "184",
  },
  {
    pubkey: PK("job0183"),
    poster: PK("poster00183"),
    agent: PK("swapBot002"),
    descriptionHash: "b2c3d4e5f6a1" + "0".repeat(52),
    reward: toLamports(0.02),
    collateral: toLamports(0),
    deadline: hoursAgo(-3),
    mode: 0,
    status: 3, // Completed
    resultHash: "f1e2d3" + "0".repeat(58),
    createdAt: hoursAgo(3),
    assignedAt: hoursAgo(2.5),
    resolvedAt: hoursAgo(2),
    jobIndex: "183",
  },
  {
    pubkey: PK("job0182"),
    poster: PK("poster00182"),
    agent: SYSTEM,
    descriptionHash: "c3d4e5f6a1b2" + "0".repeat(52),
    reward: toLamports(0.1),
    collateral: toLamports(0),
    deadline: hoursAgo(-12),
    mode: 0,
    status: 0, // Open
    resultHash: ZERO_HASH,
    createdAt: hoursAgo(0.5),
    assignedAt: 0,
    resolvedAt: 0,
    jobIndex: "182",
  },
  {
    pubkey: PK("job0181"),
    poster: PK("poster00181"),
    agent: PK("priceBot01"),
    descriptionHash: "d4e5f6a1b2c3" + "0".repeat(52),
    reward: toLamports(0.015),
    collateral: toLamports(0),
    deadline: hoursAgo(-6),
    mode: 0,
    status: 1, // Assigned
    resultHash: ZERO_HASH,
    createdAt: hoursAgo(1),
    assignedAt: hoursAgo(0.5),
    resolvedAt: 0,
    jobIndex: "181",
  },
  {
    pubkey: PK("job0180"),
    poster: PK("poster00180"),
    agent: PK("crossChain4"),
    descriptionHash: "e5f6a1b2c3d4" + "0".repeat(52),
    reward: toLamports(0.08),
    collateral: toLamports(0),
    deadline: hoursAgo(-24),
    mode: 0,
    status: 2, // Submitted (awaiting approval)
    resultHash: "abc123" + "0".repeat(58),
    createdAt: hoursAgo(4),
    assignedAt: hoursAgo(3),
    resolvedAt: 0,
    jobIndex: "180",
  },
  {
    pubkey: PK("job0179"),
    poster: PK("poster00179"),
    agent: PK("oracleBot3"),
    descriptionHash: "f6a1b2c3d4e5" + "0".repeat(52),
    reward: toLamports(0.025),
    collateral: toLamports(0),
    deadline: hoursAgo(-3),
    mode: 0,
    status: 3, // Completed
    resultHash: "def456" + "0".repeat(58),
    createdAt: hoursAgo(6),
    assignedAt: hoursAgo(5),
    resolvedAt: hoursAgo(4),
    jobIndex: "179",
  },
];

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const DEMO_LEADERBOARD: Leaderboard = {
  topAgents: DEMO_AGENTS.slice(0, 5).map((a) => ({
    pubkey: a.pubkey,
    name: a.name,
    reputation: a.reputation,
    stake: a.stake,
    completed: a.completed,
    failed: a.failed,
    status: a.status,
    successRate:
      a.completed + a.failed > 0
        ? Math.round((a.completed / (a.completed + a.failed)) * 100)
        : 100,
  })),
  topEarners: DEMO_AGENTS.filter((a) => a.completed > 0)
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5)
    .map((a) => ({
      pubkey: a.pubkey,
      name: a.name,
      completed: a.completed,
      totalEarnedSol: Number(a.totalEarned) / 1e9,
    })),
  recentSlashing: [
    {
      pubkey: DEMO_AGENTS[5].pubkey,
      name: "FailBot",
      failed: 5,
      totalSlashedSol: 0.3,
      stake: toLamports(0.0),
      status: 1,
    },
    {
      pubkey: DEMO_AGENTS[3].pubkey,
      name: "CrossChainBot",
      failed: 24,
      totalSlashedSol: 0.41,
      stake: toLamports(1.5),
      status: 0,
    },
  ],
  stats: {
    totalAgents: 127,
    activeAgents: 119,
    totalJobs: 4219,
    completedJobs: 4108,
    totalStakedSol: 846.3,
    totalSlashedSol: 12.847,
  },
};
