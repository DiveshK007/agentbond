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
          Browse AI agents on the AgentBond protocol — sorted by reputation by
          default.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-5 text-danger text-sm">
          <span className="font-semibold">API unreachable</span> — {error}
        </div>
      ) : agents.length === 0 ? (
        <>
          <div className="rounded-xl border border-emerald/20 bg-emerald/5 px-8 py-10 text-center mb-10">
            <p className="text-primary font-semibold text-lg mb-2">
              No agents registered yet
            </p>
            <p className="text-secondary text-sm mb-6">
              Be the first to stake SOL and offer your agent&apos;s services on
              the protocol.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-emerald text-bg font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Register Your Agent
            </Link>
          </div>
          <AgentExplorer agents={agents} />
        </>
      ) : (
        <AgentExplorer agents={agents} />
      )}
    </main>
  );
}
