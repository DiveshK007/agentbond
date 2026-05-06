"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface BadgeEligibility {
  tier: string;
  eligible: boolean;
  name: string;
  emoji: string;
  requirements: {
    minCompleted: number;
    minSuccessRate: number;
    minStake: number;
  };
}

interface BadgeData {
  highestBadge: { tier: string; name: string; emoji: string } | null;
  eligibility: BadgeEligibility[];
  totalEarned: number;
}

export default function BadgeDisplay({ agentPubkey }: { agentPubkey: string }) {
  const [badges, setBadges] = useState<BadgeData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/badges/${agentPubkey}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setBadges(data as BadgeData | null))
      .catch(() => null);
  }, [agentPubkey]);

  if (!badges) return null;

  const tierColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    bronze: {
      bg: "rgba(205,127,50,0.08)",
      border: "rgba(205,127,50,0.25)",
      text: "#cd7f32",
      glow: "0 0 12px rgba(205,127,50,0.15)",
    },
    silver: {
      bg: "rgba(192,192,192,0.08)",
      border: "rgba(192,192,192,0.25)",
      text: "#c0c0c0",
      glow: "0 0 12px rgba(192,192,192,0.15)",
    },
    gold: {
      bg: "rgba(255,215,0,0.08)",
      border: "rgba(255,215,0,0.25)",
      text: "#ffd700",
      glow: "0 0 16px rgba(255,215,0,0.2)",
    },
    diamond: {
      bg: "rgba(185,242,255,0.08)",
      border: "rgba(185,242,255,0.3)",
      text: "#b9f2ff",
      glow: "0 0 20px rgba(185,242,255,0.25)",
    },
  };

  return (
    <div className="flex flex-col gap-2">
      <p
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Reputation Badges (Metaplex Core NFT)
      </p>
      <div className="flex gap-2 flex-wrap">
        {badges.eligibility.map((badge) => {
          const colors = tierColors[badge.tier] ?? tierColors.bronze;
          return (
            <div
              key={badge.tier}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{
                background: badge.eligible ? colors.bg : "rgba(255,255,255,0.02)",
                borderColor: badge.eligible ? colors.border : "rgba(255,255,255,0.06)",
                color: badge.eligible ? colors.text : "rgba(255,255,255,0.2)",
                boxShadow: badge.eligible ? colors.glow : "none",
                opacity: badge.eligible ? 1 : 0.5,
              }}
              title={
                badge.eligible
                  ? `✅ Earned! ${badge.requirements.minCompleted} jobs, ${badge.requirements.minSuccessRate}% success`
                  : `Requires: ${badge.requirements.minCompleted} jobs, ${badge.requirements.minSuccessRate}% success rate`
              }
            >
              <span style={{ fontSize: "14px" }}>{badge.emoji}</span>
              <span>{badge.name}</span>
              {badge.eligible && (
                <span
                  className="ml-0.5 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: colors.text,
                    boxShadow: `0 0 6px ${colors.text}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
