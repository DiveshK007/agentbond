import type { Agent, ProtocolStats, SerializedJob, Leaderboard } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchProtocolStats(): Promise<ProtocolStats> {
  const res = await fetch(`${API_BASE}/api/protocol/stats`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json() as Promise<ProtocolStats>;
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/api/agents`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch agents: ${res.status}`);
  return res.json() as Promise<Agent[]>;
}

export async function fetchAgent(pubkey: string): Promise<Agent> {
  const res = await fetch(`${API_BASE}/api/agents/${pubkey}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Agent not found: ${res.status}`);
  return res.json() as Promise<Agent>;
}

export async function fetchJobs(status?: number): Promise<SerializedJob[]> {
  const url =
    status !== undefined
      ? `${API_BASE}/api/jobs?status=${status}`
      : `${API_BASE}/api/jobs`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json() as Promise<SerializedJob[]>;
}

export async function fetchJob(index: number): Promise<SerializedJob> {
  const res = await fetch(`${API_BASE}/api/jobs/${index}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Job not found: ${res.status}`);
  return res.json() as Promise<SerializedJob>;
}

export async function fetchLeaderboard(): Promise<Leaderboard> {
  const res = await fetch(`${API_BASE}/api/leaderboard`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  return res.json() as Promise<Leaderboard>;
}
