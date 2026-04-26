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
      ) : (
        <AgentExplorer agents={agents} />
      )}
    </main>
  );
}
