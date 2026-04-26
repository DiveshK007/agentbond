import { JOB_STATUS_CLASS, JOB_STATUS_LABEL } from "@/lib/format";

export default function StatusBadge({ status }: { status: number }) {
  const label = JOB_STATUS_LABEL[status] ?? "Unknown";
  const cls =
    JOB_STATUS_CLASS[status] ?? "bg-elevated text-muted border-line";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
}
