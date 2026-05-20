import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJob } from "@/lib/api";
import {
  formatDeadline,
  formatSol,
  formatTimestamp,
  isDefaultPubkey,
  isEmptyHash,
  jobModeName,
  JOB_STATUS_LABEL,
  truncatePubkey,
} from "@/lib/format";
import StatusBadge from "../../components/StatusBadge";
import MetadataLookup from "../../components/MetadataLookup";

export const dynamic = "force-dynamic";

const PIPELINE_STEPS = [
  { label: "Open", status: 0, color: "#3b82f6" },
  { label: "Assigned", status: 1, color: "#f59e0b" },
  { label: "Submitted", status: 2, color: "#8b5cf6" },
  { label: "Resolved", status: 3, color: "#10b981" },
];

function stepVariant(stepStatus: number, jobStatus: number): "completed" | "current" | "pending" {
  if (stepStatus === 3 && (jobStatus === 3 || jobStatus === 4)) return "current";
  if (stepStatus < jobStatus) return "completed";
  if (stepStatus === jobStatus) return "current";
  return "pending";
}

function PipelineNode({
  label,
  variant,
  isDisputed,
  isLast,
  color,
}: {
  label: string;
  variant: "completed" | "current" | "pending";
  isDisputed?: boolean;
  isLast?: boolean;
  color: string;
}) {
  const nodeColor = variant === "current" && isDisputed ? "#ef4444" : color;
  const displayLabel = label === "Resolved" ? (isDisputed ? "Disputed" : "Completed") : label;

  return (
    <div className={`flex items-start ${isLast ? "" : "flex-1"}`}>
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={
            variant === "completed"
              ? { background: nodeColor, color: "#0a0a0a" }
              : variant === "current"
                ? {
                    background: `${nodeColor}20`,
                    border: `2px solid ${nodeColor}`,
                    color: nodeColor,
                    boxShadow: `0 0 0 4px ${nodeColor}18`,
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "2px solid rgba(255,255,255,0.1)",
                    color: "var(--text-muted)",
                  }
          }
        >
          {variant === "completed" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span>{PIPELINE_STEPS.findIndex((s) => s.label === label) + 1}</span>
          )}
        </div>
        <span
          className="text-xs whitespace-nowrap font-medium"
          style={{
            color: variant === "current" ? nodeColor : variant === "completed" ? "var(--text-secondary)" : "var(--text-muted)",
          }}
        >
          {displayLabel}
        </span>
      </div>
      {!isLast && (
        <div
          className="flex-1 h-0.5 mt-4 mx-2 rounded-full"
          style={{
            background:
              variant === "completed"
                ? `linear-gradient(90deg, ${nodeColor}, rgba(255,255,255,0.08))`
                : "rgba(255,255,255,0.06)",
          }}
        />
      )}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-0">
      <span className="text-secondary text-sm shrink-0 w-32">{label}</span>
      <span className="text-primary text-sm text-right break-all">{children}</span>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ index: string }>;
}) {
  const { index } = await params;
  const jobIndex = parseInt(index, 10);

  if (isNaN(jobIndex)) notFound();

  let job;
  try {
    job = await fetchJob(jobIndex);
  } catch {
    notFound();
  }

  const isDisputed = job.status === 4;
  const isCancelled = job.status === 5;
  const isTimedOut = job.status === 6;
  const isAborted = isCancelled || isTimedOut;

  const deadline = formatDeadline(job.deadline);
  const isExpired = job.deadline < Math.floor(Date.now() / 1000);
  const agentShort = isDefaultPubkey(job.agent) ? "Unassigned" : truncatePubkey(job.agent);



  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-sm mb-10 transition-colors"
      >
        ← Jobs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-primary">Job #{job.jobIndex}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-muted text-xs font-mono truncate max-w-xs">{job.pubkey}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold font-mono gradient-text">{formatSol(job.reward)} SOL</p>
          <p className="text-muted text-xs mt-0.5">reward</p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="glass rounded-xl p-6 mb-5">
        <h2 className="text-primary font-semibold text-sm mb-6">Status Pipeline</h2>
        {isAborted ? (
          <div className="flex items-center gap-3 py-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.25)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <p className="text-danger font-semibold text-sm">
                {isCancelled ? "Cancelled" : "Timed Out"}
              </p>
              <p className="text-muted text-xs mt-0.5">
                {isCancelled
                  ? "This job was cancelled before completion."
                  : "Agent did not submit before the deadline."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start">
            {PIPELINE_STEPS.map((step, i) => (
              <PipelineNode
                key={step.label}
                label={step.label}
                variant={stepVariant(step.status, job.status)}
                isDisputed={isDisputed}
                isLast={i === PIPELINE_STEPS.length - 1}
                color={step.color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="glass rounded-xl p-6 mb-5">
        <h2 className="text-primary font-semibold text-sm mb-1">Job Details</h2>
        <DetailRow label="Poster">
          <span className="font-mono">{truncatePubkey(job.poster)}</span>
        </DetailRow>
        <DetailRow label="Agent">
          <span className={`font-mono ${isDefaultPubkey(job.agent) ? "text-muted" : ""}`}>
            {agentShort}
          </span>
        </DetailRow>
        <DetailRow label="Reward">
          <span className="font-mono gradient-text">{formatSol(job.reward)} SOL</span>
        </DetailRow>
        <DetailRow label="Collateral">
          <span className="font-mono">{formatSol(job.collateral)} SOL</span>
        </DetailRow>
        <DetailRow label="Deadline">
          <span style={{ color: isExpired ? "#ef4444" : undefined }}>
            {deadline} · {formatTimestamp(job.deadline)}
          </span>
        </DetailRow>
        <DetailRow label="Mode">
          <span>{jobModeName(job.mode)}</span>
        </DetailRow>
        <DetailRow label="Created">
          <span>{formatTimestamp(job.createdAt)}</span>
        </DetailRow>
        {job.assignedAt > 0 && (
          <DetailRow label="Assigned">
            <span>{formatTimestamp(job.assignedAt)}</span>
          </DetailRow>
        )}
        {job.resolvedAt > 0 && (
          <DetailRow label="Resolved">
            <span>{formatTimestamp(job.resolvedAt)}</span>
          </DetailRow>
        )}
      </div>

      {/* Hashes */}
      <div className="glass rounded-xl p-6 mb-5">
        <h2 className="text-primary font-semibold text-sm mb-1">Hashes</h2>
        <DetailRow label="Description">
          <span className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs break-all">{job.descriptionHash}</span>
              <MetadataLookup hash={job.descriptionHash} type="job" />
            </span>
          </span>
        </DetailRow>
        <DetailRow label="Result">
          {isEmptyHash(job.resultHash) ? (
            <span className="text-muted italic">Not submitted</span>
          ) : (
            <span className="flex flex-col items-end gap-1">
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs break-all">{job.resultHash}</span>
                <MetadataLookup hash={job.resultHash} type="result" />
              </span>
            </span>
          )}
        </DetailRow>
      </div>

      {/* Assigned Agent */}
      {!isDefaultPubkey(job.agent) && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-primary font-semibold text-sm mb-3">Assigned Agent</h2>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-secondary break-all">{job.agent}</span>
            <Link
              href={`/agents/${job.agent}`}
              className="shrink-0 ml-4 text-sm text-emerald hover:opacity-80 transition-opacity font-medium"
            >
              View Profile →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
