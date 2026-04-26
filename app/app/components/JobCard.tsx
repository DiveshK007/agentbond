import Link from "next/link";
import type { SerializedJob } from "@/lib/types";
import {
  formatDeadline,
  formatSol,
  isDefaultPubkey,
  jobModeName,
  truncateHash,
  truncatePubkey,
} from "@/lib/format";
import StatusBadge from "./StatusBadge";

export default function JobCard({ job }: { job: SerializedJob }) {
  const deadline = formatDeadline(job.deadline);
  const isExpired = job.deadline < Math.floor(Date.now() / 1000);
  const isInstant = job.mode === 1;
  const agentLabel = isDefaultPubkey(job.agent)
    ? "Unassigned"
    : truncatePubkey(job.agent);

  return (
    <Link
      href={`/jobs/${job.jobIndex}`}
      className="block bg-surface border border-line rounded-xl p-5 hover:border-line-active transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-muted text-xs font-mono mb-1">
            #{job.jobIndex} ·{" "}
            <span className="text-secondary">{truncateHash(job.descriptionHash)}</span>
          </p>
          <p className="text-secondary text-xs">
            Poster:{" "}
            <span className="font-mono text-primary">
              {truncatePubkey(job.poster)}
            </span>
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-muted text-xs mb-0.5">Reward</p>
          <p className="text-primary font-mono text-sm font-semibold">
            {formatSol(job.reward)} SOL
          </p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Collateral</p>
          <p className="text-primary font-mono text-sm">
            {formatSol(job.collateral)} SOL
          </p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Agent</p>
          <p
            className={`font-mono text-xs truncate ${
              isDefaultPubkey(job.agent) ? "text-muted italic" : "text-secondary"
            }`}
          >
            {agentLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded border font-medium ${
              isInstant
                ? "bg-accent/10 text-accent border-accent/20"
                : "bg-info/10 text-info border-info/20"
            }`}
          >
            {isInstant ? "⚡ Instant" : "📋 Job Board"}
          </span>
        </div>
        <span
          className={`text-xs font-mono ${
            isExpired ? "text-danger" : "text-secondary"
          }`}
        >
          {isExpired ? "⏰ " : "⏱ "}
          {deadline}
        </span>
      </div>
    </Link>
  );
}
