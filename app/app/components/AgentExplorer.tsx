"use client";

import { useMemo, useState } from "react";
import type { Agent } from "@/lib/types";
import AgentCard from "./AgentCard";

type SortKey = "reputation" | "stake" | "completed";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "reputation", label: "Reputation" },
  { key: "stake", label: "Stake" },
  { key: "completed", label: "Completed" },
];

export default function AgentExplorer({ agents }: { agents: Agent[] }) {
  const [sort, setSort] = useState<SortKey>("reputation");

  const sorted = useMemo(() => {
    return [...agents].sort((a, b) => {
      if (sort === "stake") return Number(b.stake) - Number(a.stake);
      if (sort === "completed") return b.completed - a.completed;
      return b.reputation - a.reputation;
    });
  }, [agents, sort]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <span className="text-muted text-xs mr-1">Sort by</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className="text-sm px-3 py-1.5 rounded-lg border transition-all"
            style={
              sort === key
                ? {
                    background: "rgba(16,185,129,0.1)",
                    borderColor: "rgba(16,185,129,0.3)",
                    color: "#10b981",
                  }
                : {
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-muted text-xs">{agents.length} agents</span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <p className="text-secondary text-base font-medium mb-1">No agents registered yet</p>
          <p className="text-muted text-sm">Be the first to register and stake SOL.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((agent) => (
            <AgentCard key={agent.owner} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
