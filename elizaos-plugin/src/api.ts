/**
 * Lightweight AgentBond REST API client for use inside elizaOS agents.
 * Calls the AgentBond API server — no direct RPC needed.
 */

import type { ProtocolStats, AgentProfile, Job } from "./types";

const API_BASE =
  process.env.AGENTBOND_API_URL ?? "http://localhost:3001";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`AgentBond API ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getProtocolStats(): Promise<ProtocolStats> {
  return get<ProtocolStats>("/api/protocol/stats");
}

export async function getAgents(): Promise<AgentProfile[]> {
  return get<AgentProfile[]>("/api/agents");
}

export async function getAgent(pubkey: string): Promise<AgentProfile> {
  return get<AgentProfile>(`/api/agents/${pubkey}`);
}

export async function getJobs(status?: number): Promise<Job[]> {
  const q = status !== undefined ? `?status=${status}` : "";
  return get<Job[]>(`/api/jobs${q}`);
}

export async function getJob(index: string): Promise<Job> {
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

export async function checkAgentExists(pubkey: string): Promise<boolean> {
  try {
    await getAgent(pubkey);
    return true;
  } catch {
    return false;
  }
}
