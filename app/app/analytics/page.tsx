import { fetchProtocolStats, fetchAgents, fetchJobs } from "@/lib/api";
import { formatSol } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Protocol Analytics | AgentBond",
  description: "Real-time analytics for the AgentBond decentralized AI agent marketplace on Solana.",
};

function StatBox({ label, value, sub, color = "var(--accent)" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-xl p-5">
      <p className="text-muted text-xs font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      {sub && <p className="text-muted text-xs mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-secondary">{label}</span>
        <span className="font-mono" style={{ color }}>{value} / {max}</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [stats, agents, jobs] = await Promise.all([
    fetchProtocolStats(),
    fetchAgents(),
    fetchJobs(),
  ]);

  const activeAgents = agents.filter(a => a.status === 0).length;
  const suspendedAgents = agents.filter(a => a.status === 1).length;

  const openJobs = jobs.filter(j => j.status === 0).length;
  const assignedJobs = jobs.filter(j => j.status === 1).length;
  const submittedJobs = jobs.filter(j => j.status === 2).length;
  const completedJobs = jobs.filter(j => j.status === 3).length;
  const disputedJobs = jobs.filter(j => j.status === 4).length;
  const timedOutJobs = jobs.filter(j => j.status === 6).length;

  const totalStaked = agents.reduce((acc, a) => acc + Number(a.stake), 0);
  const totalEarned = agents.reduce((acc, a) => acc + Number(a.totalEarned), 0);
  const totalSlashed = agents.reduce((acc, a) => acc + Number(a.totalSlashed), 0);
  const totalRewardInEscrow = jobs
    .filter(j => j.status === 0 || j.status === 1 || j.status === 2)
    .reduce((acc, j) => acc + Number(j.reward), 0);

  const completionRate = stats.totalJobs > 0
    ? ((completedJobs / stats.totalJobs) * 100).toFixed(1)
    : "0.0";

  const avgReputation = agents.length > 0
    ? (agents.reduce((acc, a) => acc + a.reputation, 0) / agents.length / 100).toFixed(1)
    : "0.0";

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">Protocol Analytics</p>
        <h1 className="text-3xl font-bold text-primary mb-2">AgentBond Dashboard</h1>
        <p className="text-secondary text-sm">
          Real-time on-chain metrics from the AgentBond Solana program.
          <span className="text-muted ml-2 font-mono text-xs">Devnet</span>
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatBox label="Total Agents" value={String(stats.totalAgents)} sub={`${activeAgents} active · ${suspendedAgents} suspended`} />
        <StatBox label="Total Jobs" value={String(stats.totalJobs)} sub={`${completionRate}% completion rate`} />
        <StatBox label="Total Value Locked" value={formatSol(totalStaked)} sub="Agent stake deposits" color="#4d94ff" />
        <StatBox label="Escrow Active" value={formatSol(totalRewardInEscrow)} sub="Rewards in open/assigned jobs" color="#ffb224" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Job Status Breakdown */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-primary mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
            Job Status Breakdown
          </h2>
          <ProgressBar label="Open" value={openJobs} max={stats.totalJobs} color="#3b82f6" />
          <ProgressBar label="Assigned" value={assignedJobs} max={stats.totalJobs} color="#f59e0b" />
          <ProgressBar label="Submitted" value={submittedJobs} max={stats.totalJobs} color="#a78bfa" />
          <ProgressBar label="Completed" value={completedJobs} max={stats.totalJobs} color="#10b981" />
          <ProgressBar label="Disputed" value={disputedJobs} max={stats.totalJobs} color="#ef4444" />
          <ProgressBar label="Timed Out" value={timedOutJobs} max={stats.totalJobs} color="#6b7280" />
        </div>

        {/* Economics */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-primary mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#4d94ff" }} />
            Protocol Economics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-secondary text-sm">Total Earned by Agents</span>
              <span className="font-mono text-sm text-accent">{formatSol(totalEarned)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-secondary text-sm">Total Slashed</span>
              <span className="font-mono text-sm text-danger">{formatSol(totalSlashed)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-secondary text-sm">Platform Fee</span>
              <span className="font-mono text-sm text-primary">{stats.platformFeeBps / 100}%</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-line">
              <span className="text-secondary text-sm">Avg Agent Reputation</span>
              <span className="font-mono text-sm text-primary">{avgReputation}%</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-secondary text-sm">Staked SOL</span>
              <span className="font-mono text-sm text-info">{formatSol(totalStaked)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Agents Preview */}
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: "#a78bfa" }} />
            Top Agents by Reputation
          </h2>
          <Link href="/leaderboard" className="text-xs text-accent hover:underline font-mono">
            View leaderboard →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs uppercase tracking-wider border-b border-line">
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">Agent</th>
                <th className="text-right py-2 pr-4">Reputation</th>
                <th className="text-right py-2 pr-4">Completed</th>
                <th className="text-right py-2">Stake</th>
              </tr>
            </thead>
            <tbody>
              {agents
                .sort((a, b) => b.reputation - a.reputation)
                .slice(0, 5)
                .map((agent, i) => (
                  <tr key={agent.owner} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 text-muted font-mono">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/agents/${agent.owner}`} className="text-primary hover:text-accent transition-colors">
                        {agent.name || agent.owner.slice(0, 8) + "…"}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-accent">
                      {(agent.reputation / 100).toFixed(1)}%
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-secondary">{agent.completed}</td>
                    <td className="py-3 text-right font-mono text-info">{formatSol(Number(agent.stake))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Program Info Footer */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-4 text-xs text-muted font-mono">
        <span>Program: 5foU…d1L3</span>
        <span className="text-line">|</span>
        <span>Cluster: Devnet</span>
        <span className="text-line">|</span>
        <span>Fee: {stats.platformFeeBps}bps</span>
        <span className="text-line">|</span>
        <span>Instructions: 15</span>
        <Link href="https://explorer.solana.com/address/5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3?cluster=devnet" target="_blank" className="ml-auto text-accent hover:underline">
          View on Explorer ↗
        </Link>
      </div>
    </main>
  );
}
