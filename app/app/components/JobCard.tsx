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

const STATUS_LEFT_BORDER: Record<number, string> = {
  0: "#3b82f6",
  1: "#f59e0b",
  2: "#8b5cf6",
  3: "#10b981",
  4: "#ef4444",
  5: "#404040",
  6: "#404040",
};

export default function JobCard({ job }: { job: SerializedJob }) {
  const deadline = formatDeadline(job.deadline);
  const isExpired = job.deadline < Math.floor(Date.now() / 1000);
  const isInstant = job.mode === 1;
  const agentLabel = isDefaultPubkey(job.agent) ? "—" : truncatePubkey(job.agent);
  const borderColor = STATUS_LEFT_BORDER[job.status] ?? "#404040";

  return (
    <Link
      href={`/jobs/${job.jobIndex}`}
      className="glass glass-hover block rounded-xl p-5 group overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-muted text-xs font-mono mb-1">
            #{job.jobIndex}
            {" · "}
            <span className="text-secondary">{truncateHash(job.descriptionHash)}</span>
          </p>
          <p className="text-muted text-xs">
            Poster:{" "}
            <span className="font-mono text-secondary">{truncatePubkey(job.poster)}</span>
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-muted text-xs mb-0.5">Reward</p>
          <p className="font-mono text-sm font-semibold gradient-text">
            {formatSol(job.reward)} SOL
          </p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Collateral</p>
          <p className="text-primary font-mono text-sm">{formatSol(job.collateral)} SOL</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Agent</p>
          <p className={`font-mono text-xs truncate ${isDefaultPubkey(job.agent) ? "text-muted" : "text-secondary"}`}>
            {agentLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-line">
        <span
          className="text-xs px-2 py-0.5 rounded border font-medium"
          style={
            isInstant
              ? { background: "rgba(139,92,246,0.1)", color: "#8b5cf6", borderColor: "rgba(139,92,246,0.2)" }
              : { background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderColor: "rgba(59,130,246,0.2)" }
          }
        >
          {isInstant ? "Instant" : "Job Board"}
        </span>
        <span
          className="text-xs font-mono"
          style={{ color: isExpired ? "#ef4444" : deadline === "Expired" ? "#ef4444" : "#737373" }}
        >
          {deadline}
        </span>
      </div>
    </Link>
  );
}
