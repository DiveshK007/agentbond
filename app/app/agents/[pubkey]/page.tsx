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

export const dynamic = "force-dynamic";

function StatCard({
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
    <div className="bg-surface border border-line rounded-xl p-5">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p
        className={`text-xl font-bold font-mono ${danger ? "text-danger" : "text-primary"}`}
      >
        {value}
      </p>
      {sub && <p className="text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function ReputationBar({
  label,
  weight,
  fill,
  colorClass,
}: {
  label: string;
  weight: number;
  fill: number;
  colorClass: string;
}) {
  const pct = Math.min(100, Math.max(0, fill * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-secondary text-xs">{label}</span>
        <span className="text-muted text-xs font-mono">{weight}% weight</span>
      </div>
      <div className="h-2 bg-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
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
  const lockedSOL = lamportsToSol(agent.lockedStake);

  const total = agent.completed + agent.failed;
  const successRateFill = total > 0 ? agent.completed / total : 0.5;
  const stakeCommitmentFill = Math.min(1, stakeSOL / 10);
  const volumeFill = Math.min(1, agent.completed / 100);
  const earningsRatioFill =
    Number(agent.stake) > 0
      ? Math.min(1, Number(agent.totalEarned) / Number(agent.stake))
      : 0;

  const breakdown = [
    {
      label: "Success Rate",
      weight: 40,
      fill: successRateFill,
      colorClass: "bg-emerald",
    },
    {
      label: "Stake Commitment",
      weight: 25,
      fill: stakeCommitmentFill,
      colorClass: "bg-info",
    },
    {
      label: "Volume",
      weight: 20,
      fill: volumeFill,
      colorClass: "bg-accent",
    },
    {
      label: "Earnings Ratio",
      weight: 15,
      fill: earningsRatioFill,
      colorClass: "bg-warning",
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm mb-10 transition-colors"
      >
        ← Back to Agents
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-primary">{displayName}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                isActive
                  ? "bg-emerald/10 text-emerald border-emerald/20"
                  : "bg-danger/10 text-danger border-danger/20"
              }`}
            >
              {isActive ? "Active" : "Suspended"}
            </span>
          </div>
          <p className="text-muted font-mono text-xs break-all">{agent.owner}</p>
          {agent.metadataUri && (
            <p className="text-muted text-xs mt-1 truncate max-w-md">
              {agent.metadataUri}
            </p>
          )}
        </div>

        <div className="sm:text-right shrink-0">
          <div className={`text-6xl font-bold tabular-nums ${repColorClass(rep)}`}>
            {repStr}
          </div>
          <div className="text-muted text-sm mt-1">reputation score</div>
          <div className="text-secondary text-xs mt-0.5">{compRate}% completion rate</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Staked"
          value={`${formatSol(agent.stake)} SOL`}
          sub={`${formatSol(agent.lockedStake)} SOL locked`}
        />
        <StatCard
          label="Available Stake"
          value={`${formatSol((Number(agent.stake) - Number(agent.lockedStake)).toString())} SOL`}
          sub={`${lockedSOL > 0 ? `${formatSol(agent.lockedStake)} locked in jobs` : "none locked"}`}
        />
        <StatCard
          label="Jobs Completed"
          value={String(agent.completed)}
          sub={`${agent.failed} failed`}
        />
        <StatCard
          label="Total Earned"
          value={`${formatSol(agent.totalEarned)} SOL`}
        />
        <StatCard
          label="Total Slashed"
          value={`${formatSol(agent.totalSlashed)} SOL`}
          danger={Number(agent.totalSlashed) > 0}
        />
        <StatCard
          label="Consecutive Fails"
          value={String(agent.consecutiveFails)}
          danger={agent.consecutiveFails > 0}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-surface border border-line rounded-xl p-6">
          <h2 className="text-primary font-semibold mb-5">
            Reputation Breakdown
          </h2>
          <div className="flex flex-col gap-4">
            {breakdown.map((b) => (
              <ReputationBar key={b.label} {...b} />
            ))}
          </div>
          <p className="text-muted text-xs mt-5">
            Bars show component fill relative to its maximum possible
            contribution.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-xl p-6">
          <h2 className="text-primary font-semibold mb-5">Services</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center mb-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-secondary text-sm font-medium">
              No services listed
            </p>
            <p className="text-muted text-xs mt-1">
              Service listings are advertised on-chain via{" "}
              <code className="font-mono">list_service</code>.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl p-6">
        <h2 className="text-primary font-semibold mb-4">About</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-secondary">Owner</span>
            <span className="text-primary font-mono text-xs">
              {agent.owner.slice(0, 8)}…{agent.owner.slice(-8)}
            </span>
          </div>
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-secondary">PDA</span>
            <span className="text-primary font-mono text-xs">
              {agent.pubkey.slice(0, 8)}…{agent.pubkey.slice(-8)}
            </span>
          </div>
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-secondary">Registered</span>
            <span className="text-primary">
              {new Date(agent.registeredAt * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-secondary">Status</span>
            <span
              className={isActive ? "text-emerald" : "text-danger"}
            >
              {isActive ? "Active" : agent.status === 1 ? "Suspended" : "Deregistered"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
