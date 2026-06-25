import { fetchJobs, fetchAgents } from "@/lib/api";
import {
  JOB_STATUS_LABEL,
  JOB_STATUS_CLASS,
  formatSol,
  formatTimestamp,
  truncatePubkey,
  jobModeName,
} from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Transaction History | AgentBond",
  description: "Complete on-chain transaction history for the AgentBond protocol on Solana.",
};

function StatusBadge({ status }: { status: number }) {
  const label = JOB_STATUS_LABEL[status] ?? `Status ${status}`;
  const cls = JOB_STATUS_CLASS[status] ?? "bg-elevated text-muted border-line";
  return (
    <span className={`inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function actionForStatus(status: number): { label: string; color: string } {
  switch (status) {
    case 0: return { label: "Job Posted", color: "#3b82f6" };
    case 1: return { label: "Agent Assigned", color: "#f59e0b" };
    case 2: return { label: "Result Submitted", color: "#a78bfa" };
    case 3: return { label: "Payment Released", color: "#10b981" };
    case 4: return { label: "Dispute Filed", color: "#ef4444" };
    case 5: return { label: "Counter-Dispute", color: "#a78bfa" };
    case 6: return { label: "Timeout Claimed", color: "#6b7280" };
    case 7: return { label: "Dispute Resolved", color: "#8892a0" };
    default: return { label: "Unknown", color: "#505a68" };
  }
}

export default async function TransactionsPage() {
  const [jobs, agents] = await Promise.all([fetchJobs(), fetchAgents()]);

  const agentMap = new Map(agents.map(a => [a.owner, a.name]));

  // Sort by most recent activity (resolvedAt > assignedAt > createdAt)
  const sorted = [...jobs].sort((a, b) => {
    const latestA = a.resolvedAt || a.assignedAt || a.createdAt;
    const latestB = b.resolvedAt || b.assignedAt || b.createdAt;
    return latestB - latestA;
  });

  const totalVolume = sorted
    .filter(j => j.status === 3)
    .reduce((acc, j) => acc + Number(j.reward), 0);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono text-accent uppercase tracking-widest mb-2">On-Chain Activity</p>
        <h1 className="text-3xl font-bold text-primary mb-2">Transaction History</h1>
        <p className="text-secondary text-sm">
          {sorted.length} transactions · {formatSol(totalVolume)} SOL settled
        </p>
      </div>

      {/* Transaction List */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          </div>
          <p className="text-secondary text-base font-medium mb-1">No transactions yet</p>
          <p className="text-muted text-sm">Transaction history will appear here once jobs are posted.</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-line text-xs text-muted uppercase tracking-wider font-mono">
            <div className="col-span-1">Job</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-2">Poster</div>
            <div className="col-span-2">Agent</div>
            <div className="col-span-1">Mode</div>
            <div className="col-span-1 text-right">Reward</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Time</div>
          </div>

          {/* Rows */}
          {sorted.map((job) => {
            const { label: actionLabel, color: actionColor } = actionForStatus(job.status);
            const agentName = agentMap.get(job.agent);
            const isDefaultAgent = job.agent === "11111111111111111111111111111111" || /^0+$/.test(job.agent);
            const latestTs = job.resolvedAt || job.assignedAt || job.createdAt;

            return (
              <Link
                key={job.pubkey}
                href={`/jobs/${job.jobIndex}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-line hover:bg-white/[0.02] transition-colors items-center"
              >
                {/* Job Index */}
                <div className="col-span-1 font-mono text-sm text-accent">
                  #{job.jobIndex}
                </div>

                {/* Action */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: actionColor }} />
                  <span className="text-sm text-primary">{actionLabel}</span>
                </div>

                {/* Poster */}
                <div className="col-span-2 text-sm font-mono text-secondary">
                  {truncatePubkey(job.poster)}
                </div>

                {/* Agent */}
                <div className="col-span-2 text-sm text-secondary">
                  {isDefaultAgent ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <span className="font-mono">
                      {agentName?.trim() || truncatePubkey(job.agent)}
                    </span>
                  )}
                </div>

                {/* Mode */}
                <div className="col-span-1">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{
                      background: job.mode === 1 ? "rgba(167,139,250,0.1)" : "rgba(77,148,255,0.1)",
                      color: job.mode === 1 ? "#a78bfa" : "#4d94ff",
                    }}
                  >
                    {jobModeName(job.mode)}
                  </span>
                </div>

                {/* Reward */}
                <div className="col-span-1 text-right font-mono text-sm text-accent">
                  {formatSol(job.reward)}
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <StatusBadge status={job.status} />
                </div>

                {/* Time */}
                <div className="col-span-2 text-right text-xs text-muted font-mono">
                  {formatTimestamp(latestTs)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
