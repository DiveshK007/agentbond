import "dotenv/config";

const API_BASE = process.env.AGENTBOND_API_URL ?? "http://localhost:3001";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`AgentBond API ${path}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

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

export const STATUS_LABEL: Record<number, string> = {
  0: "Open",
  1: "Assigned",
  2: "Submitted",
  3: "Completed",
  4: "Disputed",
  5: "Cancelled",
  6: "Timed Out",
};

export function getProtocolStats(): Promise<ProtocolStats> {
  return get<ProtocolStats>("/api/protocol/stats");
}

export function getAgents(): Promise<AgentProfile[]> {
  return get<AgentProfile[]>("/api/agents");
}

export function getAgent(pubkey: string): Promise<AgentProfile> {
  return get<AgentProfile>(`/api/agents/${pubkey}`);
}

export function getJobs(status?: number): Promise<Job[]> {
  const q = status !== undefined ? `?status=${status}` : "";
  return get<Job[]>(`/api/jobs${q}`);
}

export function getJob(index: string | number): Promise<Job> {
  return get<Job>(`/api/jobs/${index}`);
}

export async function postMetadata(description: string): Promise<{ hash: string }> {
  const res = await fetch(`${API_BASE}/api/metadata/job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error(`AgentBond metadata POST: ${res.status}`);
  return res.json() as Promise<{ hash: string }>;
}
