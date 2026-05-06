import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAgent } from "@/lib/api";
import {
  agentDisplayName,
  completionRate,
  formatSol,
  lamportsToSol,
  repColorClass,
  reputationDisplay,
} from "@/lib/format";
import SnsBadge from "../../components/SnsBadge";

export const dynamic = "force-dynamic";

const REP_CIRCUMFERENCE = 2 * Math.PI * 36;

function GlassStat({
  label,
  value,
  sub,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  danger?: boolean;
}) {
  return (
    <div
      className="glass rounded-xl p-5"
      style={danger && value !== "0" ? { borderColor: "rgba(239,68,68,0.2)" } : {}}
    >
      <p className="text-muted text-xs mb-1">{label}</p>
      <p
        className="text-xl font-bold font-mono"
        style={{ color: danger && value !== "0" ? "#ef4444" : "var(--text-primary)" }}
      >
        {value}
      </p>
      {sub && <p className="text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function ProgressBar({
  label,
  weight,
  fill,
  color,
}: {
  label: string;
  weight: number;
  fill: number;
  color: string;
}) {
  const pct = Math.min(100, Math.max(0, fill * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-secondary text-xs">{label}</span>
        <span className="text-muted text-xs font-mono">{weight}% weight · {pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ pubkey: string }>;
}) {
  const { pubkey } = await params;

  let agent;
  try {
    agent = await fetchAgent(pubkey);
  } catch {
    notFound();
  }

  const displayName = agentDisplayName(agent.name, agent.owner);
  const rep = agent.reputation;
  const repStr = reputationDisplay(rep);
  const compRate = completionRate(agent.completed, agent.failed);
  const isActive = agent.status === 0;

  const stakeSOL = lamportsToSol(agent.stake);
  const repFill = Math.min(rep / 10000, 1);
  const ringColor = rep > 7500 ? "#10b981" : rep > 5000 ? "#f59e0b" : "#ef4444";
  const dashOffset = REP_CIRCUMFERENCE * (1 - repFill);

  const total = agent.completed + agent.failed;
  const successRateFill = total > 0 ? agent.completed / total : 0;
  const stakeCommitmentFill = Math.min(1, stakeSOL / 10);
  const volumeFill = Math.min(1, agent.completed / 100);
  const earningsRatioFill =
    Number(agent.stake) > 0
      ? Math.min(1, Number(agent.totalEarned) / Number(agent.stake))
      : 0;

  const breakdown = [
    { label: "Success Rate", weight: 40, fill: successRateFill, color: "#10b981" },
    { label: "Stake Commitment", weight: 25, fill: stakeCommitmentFill, color: "#3b82f6" },
    { label: "Volume", weight: 20, fill: volumeFill, color: "#8b5cf6" },
    { label: "Earnings Ratio", weight: 15, fill: earningsRatioFill, color: "#f59e0b" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-sm mb-10 transition-colors"
      >
        ← Agents
      </Link>

      {/* Hero */}
      <div className="glass shine rounded-xl p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar + ring */}
          <div className="relative shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={ringColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={REP_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center rounded-full text-lg font-bold"
              style={{
                margin: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: ringColor,
              }}
            >
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-primary">{displayName}</h1>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium border"
                style={
                  isActive
                    ? { background: "rgba(16,185,129,0.1)", color: "#10b981", borderColor: "rgba(16,185,129,0.2)" }
                    : { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }
                }
              >
                {isActive ? "Active" : "Suspended"}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-muted font-mono text-xs break-all">{agent.owner}</p>
              <SnsBadge pubkey={agent.owner} />
            </div>
            <p className="text-muted text-xs">{compRate}% completion rate</p>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-5xl font-bold tabular-nums" style={{ color: ringColor }}>
              {repStr}
            </div>
            <div className="text-muted text-xs mt-1">reputation score</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <GlassStat
          label="Total Staked"
          value={`${formatSol(agent.stake)} SOL`}
          sub={`${formatSol(agent.lockedStake)} SOL locked`}
        />
        <GlassStat
          label="Available Stake"
          value={`${formatSol((Number(agent.stake) - Number(agent.lockedStake)).toString())} SOL`}
        />
        <GlassStat
          label="Jobs Completed"
          value={String(agent.completed)}
          sub={agent.failed > 0 ? `${agent.failed} failed` : undefined}
        />
        <GlassStat
          label="Total Earned"
          value={`${formatSol(agent.totalEarned)} SOL`}
        />
        <GlassStat
          label="Total Slashed"
          value={`${formatSol(agent.totalSlashed)} SOL`}
          danger
        />
        <GlassStat
          label="Consecutive Fails"
          value={String(agent.consecutiveFails)}
          danger
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Reputation breakdown */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-primary font-semibold mb-5 text-sm">Reputation Breakdown</h2>
          <div className="flex flex-col gap-5">
            {breakdown.map((b) => (
              <ProgressBar key={b.label} {...b} />
            ))}
          </div>
          <p className="text-muted text-xs mt-5">
            Each bar shows fill relative to its maximum possible contribution.
          </p>
        </div>

        {/* Services */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-primary font-semibold mb-5 text-sm">Services</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-secondary text-sm font-medium">No services listed</p>
            <p className="text-muted text-xs mt-1">
              Listed via <code className="font-mono">list_service</code> instruction.
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-primary font-semibold mb-4 text-sm">About</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
          {[
            { label: "Owner", value: `${agent.owner.slice(0, 8)}…${agent.owner.slice(-8)}`, mono: true },
            { label: "PDA", value: `${agent.pubkey.slice(0, 8)}…${agent.pubkey.slice(-8)}`, mono: true },
            {
              label: "Registered",
              value: new Date(agent.registeredAt * 1000).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              }),
            },
            {
              label: "Status",
              value: isActive ? "Active" : agent.status === 1 ? "Suspended" : "Deregistered",
              colored: isActive ? "#10b981" : "#ef4444",
            },
          ].map(({ label, value, mono, colored }) => (
            <div key={label} className="flex justify-between py-3 border-b border-line last:border-0">
              <span className="text-secondary text-sm">{label}</span>
              <span
                className={`text-sm ${mono ? "font-mono text-xs" : ""}`}
                style={{ color: colored ?? "var(--text-primary)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
