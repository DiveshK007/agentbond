"use client";

import { useSnsName } from "../hooks/useSnsName";

/**
 * Inline client component that resolves and displays a .sol domain badge
 * for a given pubkey. Renders nothing if no domain is found.
 * Designed to be embedded in server components.
 */
export default function SnsBadge({ pubkey }: { pubkey: string }) {
  const { snsName } = useSnsName(pubkey);

  if (!snsName) return null;

  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-md inline-block"
      style={{
        background: "rgba(20,184,166,0.1)",
        color: "#14b8a6",
        border: "1px solid rgba(20,184,166,0.2)",
      }}
    >
      {snsName}
    </span>
  );
}
