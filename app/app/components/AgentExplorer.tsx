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
        <span className="text-secondary text-sm mr-1">Sort by</span>
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              sort === key
                ? "border-emerald text-emerald bg-emerald/10"
                : "border-line text-secondary hover:border-line-active hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-muted text-sm">{agents.length} agents</span>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-secondary text-lg font-medium mb-1">
            No agents registered yet
          </p>
          <p className="text-muted text-sm">
            Be the first to register and stake SOL.
          </p>
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
