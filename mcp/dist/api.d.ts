import "dotenv/config";
export interface ProtocolStats {
    totalAgents: number;
    totalJobs: number;
    jobsCompleted: number;
    solStaked: number;
    solSlashed: number;
    platformFeeBps: number;
}
export interface AgentProfile {
    pubkey: string;
    owner: string;
    name: string;
    stake: string;
    reputation: number;
    completed: number;
    failed: number;
    status: number;
}
export interface Job {
    pubkey: string;
    poster: string;
    agent: string;
    descriptionHash: string;
    reward: string;
    status: number;
    jobIndex: string;
    deadline: number;
}
export declare const STATUS_LABEL: Record<number, string>;
export declare function getProtocolStats(): Promise<ProtocolStats>;
export declare function getAgents(): Promise<AgentProfile[]>;
export declare function getAgent(pubkey: string): Promise<AgentProfile>;
export declare function getJobs(status?: number): Promise<Job[]>;
export declare function getJob(index: string | number): Promise<Job>;
export declare function postMetadata(description: string): Promise<{
    hash: string;
}>;
//# sourceMappingURL=api.d.ts.map