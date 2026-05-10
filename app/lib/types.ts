export interface ProtocolStats {
  totalAgents: number;
  totalJobs: number;
  jobsCompleted: number;
  solStaked: number;
  solSlashed: number;
  platformFeeBps: number;
}

export interface Agent {
  pubkey: string;
  owner: string;
  name: string;
  metadataUri: string;
  stake: string;
  lockedStake: string;
  reputation: number;
  completed: number;
  failed: number;
  consecutiveFails: number;
  totalEarned: string;
  totalSlashed: string;
  registeredAt: number;
  status: number;
}

export interface LeaderboardAgent {
  pubkey: string;
  name: string;
  reputation: number;
  stake: string;
  completed: number;
  failed: number;
  status: number;
  successRate: number;
}

export interface LeaderboardEarner {
  pubkey: string;
  name: string;
  completed: number;
  totalEarnedSol: number;
}

export interface LeaderboardSlashed {
  pubkey: string;
  name: string;
  failed: number;
  totalSlashedSol: number;
  stake: string;
  status: number;
}

export interface Leaderboard {
  topAgents: LeaderboardAgent[];
  topEarners: LeaderboardEarner[];
  recentSlashing: LeaderboardSlashed[];
  stats: {
    totalAgents: number;
    activeAgents: number;
    totalJobs: number;
    completedJobs: number;
    totalStakedSol: number;
    totalSlashedSol: number;
  };
}

export interface SerializedJob {
  pubkey: string;
  poster: string;
  agent: string;
  descriptionHash: string;
  reward: string;
  collateral: string;
  deadline: number;
  mode: number;
  status: number;
  resultHash: string;
  createdAt: number;
  assignedAt: number;
  resolvedAt: number;
  jobIndex: string;
}
