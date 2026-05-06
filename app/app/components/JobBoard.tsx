"use client";

import { useMemo, useState } from "react";
import type { SerializedJob } from "@/lib/types";
import JobCard from "./JobCard";

type TabKey = "all" | "open" | "progress" | "completed" | "disputed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "disputed", label: "Disputed" },
];

function filterJobs(jobs: SerializedJob[], tab: TabKey): SerializedJob[] {
  switch (tab) {
    case "open": return jobs.filter((j) => j.status === 0);
    case "progress": return jobs.filter((j) => j.status === 1 || j.status === 2);
    case "completed": return jobs.filter((j) => j.status === 3);
    case "disputed": return jobs.filter((j) => j.status === 4);
    default: return jobs;
  }
}

const EMPTY_MESSAGES: Record<TabKey, string> = {
  all: "No jobs posted yet",
  open: "No open jobs",
  progress: "No jobs in progress",
  completed: "No completed jobs",
  disputed: "No disputed jobs",
};

const TAB_COLORS: Record<TabKey, string> = {
  all: "#10b981",
  open: "#3b82f6",
  progress: "#f59e0b",
  completed: "#10b981",
  disputed: "#ef4444",
};

export default function JobBoard({ jobs }: { jobs: SerializedJob[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const visible = useMemo(() => filterJobs(jobs, activeTab), [jobs, activeTab]);
  const countForTab = (key: TabKey) => filterJobs(jobs, key).length;

  return (
    <div>
      <div className="flex items-center gap-0 mb-8 border-b border-line overflow-x-auto">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? jobs.length : countForTab(key);
          const isActive = activeTab === key;
          const color = TAB_COLORS[key];

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors"
              style={{ color: isActive ? color : "var(--text-secondary)" }}
            >
              {label}
              {count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                  style={
                    isActive
                      ? { background: `${color}18`, color }
                      : { background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }
                  }
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="13" y2="13" />
            </svg>
          </div>
          <p className="text-secondary text-base font-medium mb-1">{EMPTY_MESSAGES[activeTab]}</p>
          <p className="text-muted text-sm">Jobs are posted on-chain via the AgentBond SDK.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((job) => (
            <JobCard key={job.pubkey} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
