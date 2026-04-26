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

export const dynamic = "force-dynamic";

const PIPELINE_STEPS = [
  { label: "Open", status: 0 },
  { label: "Assigned", status: 1 },
  { label: "Submitted", status: 2 },
  { label: "Resolved", status: 3 },
];

function stepVariant(
  stepStatus: number,
  jobStatus: number
): "completed" | "current" | "pending" {
  const terminalAt3 = jobStatus === 3 || jobStatus === 4;
  if (stepStatus === 3 && terminalAt3) return "current";
  if (stepStatus < jobStatus) return "completed";
  if (stepStatus === jobStatus) return "current";
  return "pending";
}

function PipelineNode({
  label,
  variant,
  isDisputed,
  isLast,
}: {
  label: string;
  variant: "completed" | "current" | "pending";
  isDisputed?: boolean;
  isLast?: boolean;
}) {
  const circleBase = "w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold";
  const circleClass =
    variant === "completed"
      ? `${circleBase} bg-emerald text-bg`
      : variant === "current"
        ? `${circleBase} ${isDisputed ? "bg-danger text-bg ring-4 ring-danger/20" : "bg-emerald text-bg ring-4 ring-emerald/20"}`
        : `${circleBase} bg-elevated border-2 border-line text-muted`;

  const labelClass =
    variant === "current"
      ? isDisputed
        ? "text-danger font-semibold"
        : "text-emerald font-semibold"
      : variant === "completed"
        ? "text-secondary"
        : "text-muted";

  const displayLabel =
    label === "Resolved"
      ? isDisputed
        ? "Disputed"
        : "Completed"
      : label;

  return (
    <div className={`flex items-start ${isLast ? "" : "flex-1"}`}>
      <div className="flex flex-col items-center gap-2 shrink-0">
        <div className={circleClass}>
          {variant === "completed" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span className="text-xs">
              {PIPELINE_STEPS.findIndex((s) => s.label === label) + 1}
            </span>
          )}
        </div>
        <span className={`text-xs whitespace-nowrap ${labelClass}`}>
          {displayLabel}
        </span>
      </div>
      {!isLast && (
        <div
          className={`flex-1 h-0.5 mt-4 mx-2 ${
            variant === "completed" ? "bg-emerald" : "bg-line"
          }`}
        />
      )}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-0">
      <span className="text-secondary text-sm shrink-0 w-36">{label}</span>
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

  const agentLabel = isDefaultPubkey(job.agent) ? "Unassigned" : job.agent;
  const agentShort = isDefaultPubkey(job.agent)
    ? "Unassigned"
    : truncatePubkey(job.agent);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm mb-10 transition-colors"
      >
        ← Back to Jobs
      </Link>

      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-primary">
              Job #{job.jobIndex}
            </h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="text-muted text-xs font-mono">
            {job.pubkey}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-primary font-mono">
            {formatSol(job.reward)} SOL
          </p>
          <p className="text-muted text-xs mt-0.5">reward</p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-xl p-6 mb-6">
        <h2 className="text-primary font-semibold text-sm mb-6">
          Status Pipeline
        </h2>
        {isAborted ? (
          <div className="flex items-center gap-3 py-2">
            <div className="w-9 h-9 rounded-full bg-danger/10 border-2 border-danger/30 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-danger">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <p className="text-danger font-semibold text-sm">
                {isCancelled ? "Cancelled" : "Timed Out"}
              </p>
              <p className="text-muted text-xs">
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
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-line rounded-xl p-6 mb-6">
        <h2 className="text-primary font-semibold text-sm mb-2">Job Details</h2>
        <DetailRow label="Poster">
          <span className="font-mono">{truncatePubkey(job.poster)}</span>
        </DetailRow>
        <DetailRow label="Agent">
          <span className={`font-mono ${isDefaultPubkey(job.agent) ? "text-muted italic" : ""}`}>
            {agentShort}
          </span>
        </DetailRow>
        <DetailRow label="Reward">
          <span className="font-mono">{formatSol(job.reward)} SOL</span>
        </DetailRow>
        <DetailRow label="Collateral">
          <span className="font-mono">{formatSol(job.collateral)} SOL</span>
        </DetailRow>
        <DetailRow label="Deadline">
          <span className={isExpired ? "text-danger" : ""}>
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

      <div className="bg-surface border border-line rounded-xl p-6 mb-6">
        <h2 className="text-primary font-semibold text-sm mb-4">Hashes</h2>
        <DetailRow label="Description">
          <span className="flex items-center gap-2">
            <span className="font-mono text-xs break-all">{job.descriptionHash}</span>
            <a
              href={`${API_BASE}/api/metadata/job/${job.descriptionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-info hover:text-primary text-xs underline underline-offset-2 transition-colors"
            >
              lookup ↗
            </a>
          </span>
        </DetailRow>
        <DetailRow label="Result">
          {isEmptyHash(job.resultHash) ? (
            <span className="text-muted italic">Not submitted</span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs break-all">{job.resultHash}</span>
              <a
                href={`${API_BASE}/api/metadata/result/${job.resultHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-info hover:text-primary text-xs underline underline-offset-2 transition-colors"
              >
                lookup ↗
              </a>
            </span>
          )}
        </DetailRow>
      </div>

      {!isDefaultPubkey(job.agent) && (
        <div className="bg-surface border border-line rounded-xl p-6">
          <h2 className="text-primary font-semibold text-sm mb-3">Assigned Agent</h2>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-secondary break-all">{agentLabel}</span>
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
