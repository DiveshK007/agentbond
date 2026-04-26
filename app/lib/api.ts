import type { Agent } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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
