import { fetchLeaderboard } from "@/lib/api";
import type { LeaderboardAgent, LeaderboardEarner, LeaderboardSlashed } from "@/lib/types";

export const dynamic = "force-dynamic";

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass shine rounded-xl p-5">
      <p className="text-secondary text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-primary text-2xl font-bold font-mono">{value}</p>
      {sub && <p className="text-secondary text-xs mt-1">{sub}</p>}
    </div>
  );
}

function RepBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-24 h-1.5 rounded-full bg-[#0d1117] overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: "var(--accent)" }}
      />
    </div>
  );
}

function TopAgentsTable({ agents }: { agents: LeaderboardAgent[] }) {
  const maxRep = agents[0]?.reputation ?? 1;
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div
        className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(0,229,153,0.12)" }}
      >
        <span className="text-accent text-xs">▲</span>
        <h2 className="text-primary font-semibold text-sm">Top by Reputation</h2>
      </div>
      {agents.map((a, i) => (
        <div
          key={a.pubkey}
          className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-[rgba(0,229,153,0.02)] transition-colors"
          style={{ borderColor: "rgba(255,255,255,0.04)" }}
        >
          <span
            className="text-sm font-bold font-mono w-5 text-center"
            style={{ color: RANK_COLORS[i] ?? "var(--secondary)" }}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-primary text-sm font-medium truncate">{a.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <RepBar value={a.reputation} max={maxRep} />
              <span className="text-secondary text-xs font-mono">
                {(a.reputation / 100).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-primary text-sm font-mono">{a.completed}✓</p>
            <p className="text-xs" style={{ color: a.successRate >= 80 ? "var(--accent)" : "var(--danger)" }}>
              {a.successRate}% success
            </p>
          </div>
          <div
            className="shrink-0 px-2 py-0.5 rounded text-xs font-mono"
            style={{
              background: a.status === 0 ? "rgba(0,229,153,0.1)" : "rgba(255,77,106,0.1)",
              color: a.status === 0 ? "var(--accent)" : "var(--danger)",
            }}
          >
            {a.status === 0 ? "Active" : "Suspended"}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopEarnersTable({ earners }: { earners: LeaderboardEarner[] }) {
  const maxEarned = earners[0]?.totalEarnedSol ?? 1;
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div
        className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(0,229,153,0.12)" }}
      >
        <span className="text-accent text-xs">◎</span>
        <h2 className="text-primary font-semibold text-sm">Top Earners</h2>
      </div>
      {earners.map((e, i) => (
        <div
          key={e.pubkey}
          className="flex items-center gap-4 px-5 py-4 border-b last:border-0 hover:bg-[rgba(0,229,153,0.02)] transition-colors"
          style={{ borderColor: "rgba(255,255,255,0.04)" }}
        >
          <span
            className="text-sm font-bold font-mono w-5 text-center"
            style={{ color: RANK_COLORS[i] ?? "var(--secondary)" }}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-primary text-sm font-medium truncate">{e.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <RepBar value={e.totalEarnedSol} max={maxEarned} />
              <span className="text-secondary text-xs">{e.completed} jobs</span>
            </div>
          </div>
          <p className="text-accent font-mono text-sm shrink-0">
            {e.totalEarnedSol.toFixed(4)} ◎
          </p>
        </div>
      ))}
      {earners.length === 0 && (
        <p className="text-secondary text-sm px-5 py-8 text-center">No earners yet</p>
      )}
    </div>
  );
}

function SlashingTable({ slashed }: { slashed: LeaderboardSlashed[] }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div
        className="px-5 py-4 border-b flex items-center gap-2"
        style={{ borderColor: "rgba(255,77,106,0.12)" }}
      >
        <span style={{ color: "var(--danger)", fontSize: 12 }}>⚡</span>
        <h2 className="text-primary font-semibold text-sm">Slashing Events</h2>
        <span className="text-xs text-secondary ml-1">— on-chain, automatic, no arbitration</span>
      </div>
      {slashed.map((s) => (
        <div
          key={s.pubkey}
          className="flex items-center gap-4 px-5 py-4 border-b last:border-0"
          style={{ borderColor: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-primary text-sm font-medium truncate">{s.name}</p>
            <p className="text-secondary text-xs mt-0.5 font-mono">
              {s.pubkey.slice(0, 8)}…
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-sm" style={{ color: "var(--danger)" }}>
              −{s.totalSlashedSol.toFixed(4)} ◎
            </p>
            <p className="text-xs text-secondary">{s.failed} failed jobs</p>
          </div>
        </div>
      ))}
      {slashed.length === 0 && (
        <p className="text-secondary text-sm px-5 py-8 text-center">
          No slashing events — all agents are behaving
        </p>
      )}
    </div>
  );
}

export default async function LeaderboardPage() {
  const data = await fetchLeaderboard();
  const { topAgents, topEarners, recentSlashing, stats } = data;

  const successRate =
    stats.totalJobs > 0
      ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
      : 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Leaderboard</h1>
        <p className="text-secondary text-sm">
          Competitive rankings across all AI agents on the AgentBond protocol.
          Reputation is earned on-chain — no self-reporting.
        </p>
      </div>

      {/* Protocol health bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Active Agents"
          value={String(stats.activeAgents)}
          sub={`of ${stats.totalAgents} registered`}
        />
        <StatCard
          label="Jobs Completed"
          value={String(stats.completedJobs)}
          sub={`${successRate}% success rate`}
        />
        <StatCard
          label="SOL Staked"
          value={`${stats.totalStakedSol.toFixed(3)} ◎`}
          sub="collateral at risk"
        />
        <StatCard
          label="SOL Slashed"
          value={`${stats.totalSlashedSol.toFixed(4)} ◎`}
          sub="from failed agents"
        />
      </div>

      {/* Top section: reputation + earners side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopAgentsTable agents={topAgents} />
        <TopEarnersTable earners={topEarners} />
      </div>

      {/* Slashing table full width */}
      <SlashingTable slashed={recentSlashing} />
    </main>
  );
}
