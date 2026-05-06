"use client";

import Link from "next/link";
import type { Agent } from "@/lib/types";
import {
  agentDisplayName,
  completionRate,
  formatSol,
  repColorClass,
  reputationDisplay,
  truncatePubkey,
} from "@/lib/format";
import { useSnsName } from "../hooks/useSnsName";
import SwigBadge from "./SwigBadge";

const REP_CIRCUMFERENCE = 2 * Math.PI * 22;

export default function AgentCard({ agent }: { agent: Agent }) {
  const displayName = agentDisplayName(agent.name, agent.owner);
  const { snsName } = useSnsName(agent.owner);
  const repStr = reputationDisplay(agent.reputation);
  const compRate = completionRate(agent.completed, agent.failed);
  const stakeSOL = formatSol(agent.stake);
  const isActive = agent.status === 0;
  const repFill = Math.min(agent.reputation / 10000, 1);
  const dashOffset = REP_CIRCUMFERENCE * (1 - repFill);
  const ringColor = agent.reputation > 7500 ? "#10b981" : agent.reputation > 5000 ? "#f59e0b" : "#ef4444";

  return (
    <div
      className="rounded-xl p-6 flex flex-col gap-5"
      style={{
        background: "rgba(20,20,20,0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s cubic-bezier(0.4,0,0.2,1), border-color 0.2s cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 0 0 1px rgba(16,185,129,0.18), 0 12px 40px rgba(0,0,0,0.5), 0 0 28px rgba(16,185,129,0.06)";
        el.style.borderColor = "rgba(16,185,129,0.22)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "";
        el.style.boxShadow = "";
        el.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-primary font-semibold truncate">{displayName}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-muted text-xs font-mono">{truncatePubkey(agent.owner)}</p>
            {snsName && (
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(20,184,166,0.1)",
                  color: "#14b8a6",
                  border: "1px solid rgba(20,184,166,0.2)",
                }}
              >
                {snsName}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isActive ? "#10b981" : "#ef4444",
              animation: isActive ? "pulse-dot 2s ease-in-out infinite" : undefined,
              boxShadow: isActive ? "0 0 6px rgba(16,185,129,0.6)" : undefined,
            }}
          />
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium border"
            style={
              isActive
                ? { background: "rgba(16,185,129,0.1)", color: "#10b981", borderColor: "rgba(16,185,129,0.2)" }
                : { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }
            }
          >
            {isActive ? "Active" : "Suspended"}
          </span>
        </div>
      </div>

      {/* Swig wallet permission badge */}
      {(() => {
        // Map known bot names to their Swig preset
        const SWIG_PRESETS: Record<string, string> = {
          pricebot: "readonly",
          swapbot: "swap",
          portfoliobot: "portfolio",
          crosschainbot: "swap",
          failbot: "readonly",
        };
        const botKey = displayName.toLowerCase().replace(/\s+/g, "");
        const preset = SWIG_PRESETS[botKey];
        return preset ? <SwigBadge preset={preset} /> : null;
      })()}

      {/* Reputation ring */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="22"
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={REP_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 28 28)"
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums"
            style={{ color: ringColor }}
          >
            {repStr}
          </span>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Reputation</p>
          <p className={`text-2xl font-bold tabular-nums ${repColorClass(agent.reputation)}`}>
            {repStr}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-muted text-xs mb-0.5">Staked</p>
          <p className="text-primary font-mono text-sm font-medium">{stakeSOL} SOL</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Completion</p>
          <p className="text-primary font-mono text-sm font-medium">{compRate}%</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Completed</p>
          <p className="text-primary font-mono text-sm font-medium">{agent.completed}</p>
        </div>
        <div>
          <p className="text-muted text-xs mb-0.5">Failed</p>
          <p
            className="font-mono text-sm font-medium"
            style={{ color: agent.failed > 0 ? "#ef4444" : undefined }}
          >
            {agent.failed || <span className="text-muted">—</span>}
          </p>
        </div>
      </div>

      <Link
        href={`/agents/${agent.owner}`}
        className="mt-auto block w-full text-center text-sm font-medium py-2.5 rounded-lg transition-all border border-line text-secondary hover:text-primary group"
        style={{
          background: "rgba(255,255,255,0.02)",
        }}
      >
        View Profile{" "}
        <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    </div>
  );
}
