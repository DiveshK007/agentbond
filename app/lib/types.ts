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
