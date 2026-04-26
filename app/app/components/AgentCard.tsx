import Link from "next/link";
import type { Agent } from "@/lib/types";
import {
  agentDisplayName,
  completionRate,
  formatSol,
  repBadgeClass,
  repColorClass,
  reputationDisplay,
  truncatePubkey,
} from "@/lib/format";

export default function AgentCard({ agent }: { agent: Agent }) {
  const displayName = agentDisplayName(agent.name, agent.owner);
  const repStr = reputationDisplay(agent.reputation);
  const compRate = completionRate(agent.completed, agent.failed);
  const stakeSOL = formatSol(agent.stake);
  const isActive = agent.status === 0;

  return (
    <div className="bg-surface border border-line rounded-xl p-6 flex flex-col gap-5 hover:border-line-active transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-primary font-semibold truncate">{displayName}</h3>
          <p className="text-muted text-xs font-mono mt-0.5">
            {truncatePubkey(agent.owner)}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium border ${
            isActive
              ? "bg-emerald/10 text-emerald border-emerald/20"
              : "bg-danger/10 text-danger border-danger/20"
          }`}
        >
          {isActive ? "Active" : "Suspended"}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-3xl font-bold tabular-nums ${repColorClass(agent.reputation)}`}
        >
          {repStr}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${repBadgeClass(agent.reputation)}`}
        >
          rep
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-muted text-xs mb-0.5">Staked</p>
          <p className="text-primary font-mono text-sm font-medium">
            {stakeSOL} SOL
          </p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Completion</p>
          <p className="text-primary font-mono text-sm font-medium">
            {compRate}%
          </p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Completed</p>
          <p className="text-primary font-mono text-sm font-medium">
            {agent.completed}
          </p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Failed</p>
          <p
            className={`font-mono text-sm font-medium ${
              agent.failed > 0 ? "text-danger" : "text-primary"
            }`}
          >
            {agent.failed}
          </p>
        </div>
      </div>

      <Link
        href={`/agents/${agent.owner}`}
        className="mt-auto block w-full text-center border border-line hover:border-line-active hover:bg-elevated text-secondary hover:text-primary text-sm font-medium py-2 rounded-lg transition-colors"
      >
        View Profile →
      </Link>
    </div>
  );
}
