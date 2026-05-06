"use client";

/**
 * SwigBadge displays the Swig smart wallet permission scope for an agent.
 * Shows a visual indicator of what actions the agent's wallet can perform,
 * providing transparency into the economic guardrails.
 */

interface SwigBadgeProps {
  /** The permission preset name (e.g. "swap", "readonly", "portfolio", "admin") */
  preset: string;
  /** Optional: the Swig wallet address */
  swigAddress?: string;
}

const PRESET_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string; borderColor: string }
> = {
  swap: {
    label: "Swap Enabled",
    icon: "⇄",
    color: "#10b981",
    bgColor: "rgba(16,185,129,0.08)",
    borderColor: "rgba(16,185,129,0.2)",
  },
  readonly: {
    label: "Read Only",
    icon: "🔒",
    color: "#6366f1",
    bgColor: "rgba(99,102,241,0.08)",
    borderColor: "rgba(99,102,241,0.2)",
  },
  portfolio: {
    label: "View Only",
    icon: "📊",
    color: "#8b5cf6",
    bgColor: "rgba(139,92,246,0.08)",
    borderColor: "rgba(139,92,246,0.2)",
  },
  admin: {
    label: "Full Access",
    icon: "⚡",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.2)",
  },
};

export default function SwigBadge({ preset, swigAddress }: SwigBadgeProps) {
  const config = PRESET_CONFIG[preset] ?? {
    label: preset,
    icon: "🔑",
    color: "#94a3b8",
    bgColor: "rgba(148,163,184,0.08)",
    borderColor: "rgba(148,163,184,0.2)",
  };

  return (
    <div
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md"
      style={{
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
      }}
      title={
        swigAddress
          ? `Swig Wallet: ${swigAddress}\nPermissions: ${config.label}`
          : `Swig Permissions: ${config.label}`
      }
    >
      <span className="text-[10px]">{config.icon}</span>
      <span>Swig</span>
      <span
        className="w-px h-3 mx-0.5"
        style={{ background: config.borderColor }}
      />
      <span>{config.label}</span>
    </div>
  );
}
