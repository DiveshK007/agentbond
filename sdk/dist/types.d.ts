import { PublicKey } from "@solana/web3.js";
export declare enum AgentStatus {
    Active = 0,
    Suspended = 1,
    Deregistered = 2
}
export declare enum JobStatus {
    Open = 0,
    Assigned = 1,
    Submitted = 2,
    Completed = 3,
    Disputed = 4,
    Cancelled = 5,
    TimedOut = 6
}
export declare enum JobMode {
    Open = 0,
    Direct = 1
}
export interface ProtocolConfig {
    admin: PublicKey;
    totalAgents: bigint;
    totalJobs: bigint;
    totalVolume: bigint;
    platformFeeBps: number;
    bump: number;
}
export interface AgentProfile {
    owner: PublicKey;
    name: Uint8Array;
    metadataUri: Uint8Array;
    stake: bigint;
    lockedStake: bigint;
    reputation: number;
    completed: number;
    failed: number;
    consecutiveFails: number;
    totalEarned: bigint;
    totalSlashed: bigint;
    registeredAt: bigint;
    status: AgentStatus;
    bump: number;
}
export interface ServiceListing {
    agent: PublicKey;
    capability: Uint8Array;
    price: bigint;
    isActive: boolean;
    totalCalls: bigint;
    bump: number;
}
export interface Job {
    poster: PublicKey;
    agent: PublicKey;
    descriptionHash: Uint8Array;
    reward: bigint;
    collateral: bigint;
    deadline: bigint;
    mode: JobMode;
    status: JobStatus;
    resultHash: Uint8Array;
    createdAt: bigint;
    assignedAt: bigint;
    resolvedAt: bigint;
    jobIndex: bigint;
    bump: number;
}
export interface Bid {
    job: PublicKey;
    agent: PublicKey;
    price: bigint;
    estimatedSeconds: number;
    createdAt: bigint;
    bump: number;
}
//# sourceMappingURL=types.d.ts.map