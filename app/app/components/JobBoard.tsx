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
    case "open":
      return jobs.filter((j) => j.status === 0);
    case "progress":
      return jobs.filter((j) => j.status === 1 || j.status === 2);
    case "completed":
      return jobs.filter((j) => j.status === 3);
    case "disputed":
      return jobs.filter((j) => j.status === 4);
    default:
      return jobs;
  }
}

const EMPTY_MESSAGES: Record<TabKey, string> = {
  all: "No jobs posted yet",
  open: "No open jobs",
  progress: "No jobs in progress",
  completed: "No completed jobs",
  disputed: "No disputed jobs",
};

export default function JobBoard({ jobs }: { jobs: SerializedJob[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const visible = useMemo(
    () => filterJobs(jobs, activeTab),
    [jobs, activeTab]
  );

  const countForTab = (key: TabKey) => filterJobs(jobs, key).length;

  return (
    <div>
      <div className="flex items-center gap-1 mb-8 border-b border-line overflow-x-auto pb-px">
        {TABS.map(({ key, label }) => {
          const count = key === "all" ? jobs.length : countForTab(key);
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-emerald text-emerald"
                  : "border-transparent text-secondary hover:text-primary hover:border-line-active"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-emerald/15 text-emerald"
                      : "bg-elevated text-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-secondary text-lg font-medium mb-1">
            {EMPTY_MESSAGES[activeTab]}
          </p>
          <p className="text-muted text-sm">
            Jobs are posted on-chain via the AgentBond SDK.
          </p>
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
