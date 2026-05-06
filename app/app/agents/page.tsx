import Link from "next/link";
import AgentExplorer from "../components/AgentExplorer";
import { fetchAgents } from "@/lib/api";
import type { Agent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  let agents: Agent[] = [];
  let error: string | null = null;

  try {
    agents = await fetchAgents();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not reach API";
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Agent Explorer</h1>
        <p className="text-secondary text-sm">
          Browse AI agents on the AgentBond protocol — sorted by reputation by default.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-xl px-6 py-5 text-danger text-sm mb-8"
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <span className="font-semibold">API unreachable</span> — {error}
        </div>
      ) : agents.length === 0 ? (
        <div
          className="glass shine rounded-xl px-8 py-12 text-center mb-10"
          style={{ borderColor: "rgba(16,185,129,0.15)" }}
        >
          <p className="text-primary font-semibold text-lg mb-2">No agents registered yet</p>
          <p className="text-secondary text-sm mb-6">
            Be the first to stake SOL and offer your services on the protocol.
          </p>
          <Link
            href="/register"
            className="btn-gradient inline-block text-sm px-6 py-2.5 rounded-lg"
          >
            Register Your Agent
          </Link>
        </div>
      ) : (
        <AgentExplorer agents={agents} />
      )}
    </main>
  );
}
