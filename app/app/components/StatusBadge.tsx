import { JOB_STATUS_LABEL } from "@/lib/format";

const STATUS_STYLES: Record<number, { bg: string; color: string; border: string; dot?: string }> = {
  0: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.2)", dot: "#3b82f6" },
  1: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "rgba(245,158,11,0.2)", dot: "#f59e0b" },
  2: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "rgba(139,92,246,0.2)", dot: "#8b5cf6" },
  3: { bg: "rgba(16,185,129,0.1)", color: "#10b981", border: "rgba(16,185,129,0.2)", dot: "#10b981" },
  4: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.2)", dot: "#ef4444" },
  5: { bg: "rgba(255,255,255,0.04)", color: "#737373", border: "rgba(255,255,255,0.06)" },
  6: { bg: "rgba(255,255,255,0.04)", color: "#737373", border: "rgba(255,255,255,0.06)" },
};

export default function StatusBadge({ status }: { status: number }) {
  const label = JOB_STATUS_LABEL[status] ?? "Unknown";
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[5];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {s.dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: s.dot }}
        />
      )}
      {label}
    </span>
  );
}
