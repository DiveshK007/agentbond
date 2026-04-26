"use client";

import { useState } from "react";
import Link from "next/link";
import type { Agent, SerializedJob } from "@/lib/types";
import {
  agentDisplayName,
  completionRate,
  formatSol,
  repColorClass,
  reputationDisplay,
} from "@/lib/format";
import JobCard from "../components/JobCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type AgentState = Agent | false | null;
// null = not yet looked up, false = looked up but no agent profile found

export default function DashboardPage() {
  const [inputValue, setInputValue] = useState("");
  const [walletPubkey, setWalletPubkey] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentState>(null);
  const [jobs, setJobs] = useState<SerializedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const pubkey = inputValue.trim();
    if (!pubkey) return;

    setLoading(true);
    setError(null);
    setAgent(null);
    setJobs([]);

    try {
      const [agentRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/api/agents/${pubkey}`),
        fetch(`${API_BASE}/api/jobs`),
      ]);

      setAgent(agentRes.ok ? ((await agentRes.json()) as Agent) : false);
      setJobs(jobsRes.ok ? ((await jobsRes.json()) as SerializedJob[]) : []);
      setWalletPubkey(pubkey);
    } catch {
      setError("Could not reach API — make sure the server is running on port 3001.");
    } finally {
      setLoading(false);
    }
  }

  const isAgent = agent !== null && agent !== false;
  const isUser = agent === false;

  const activeJobs = jobs.filter(
    (j) => j.agent === walletPubkey && (j.status === 1 || j.status === 2)
  );
  const postedJobs = jobs.filter((j) => j.poster === walletPubkey);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
        <p className="text-secondary text-sm">
          Enter a wallet pubkey to view its agent profile and job history.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3 mb-10">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste Solana wallet pubkey (base58)…"
          spellCheck={false}
          className="flex-1 bg-elevated border border-line rounded-lg px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors font-mono"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="shrink-0 bg-emerald text-bg font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Looking up…" : "Look Up"}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-4 text-danger text-sm mb-8">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-6 h-6 border-2 border-line border-t-emerald rounded-full animate-spin" />
        </div>
      )}

      {!loading && isAgent && (
        <AgentView agent={agent as Agent} activeJobs={activeJobs} />
      )}

      {!loading && isUser && walletPubkey && (
        <UserView pubkey={walletPubkey} postedJobs={postedJobs} />
      )}
    </main>
  );
}

function AgentView({
  agent,
  activeJobs,
}: {
  agent: Agent;
  activeJobs: SerializedJob[];
}) {
  const displayName = agentDisplayName(agent.name, agent.owner);
  const isActive = agent.status === 0;
  const availableLamports = Number(agent.stake) - Number(agent.lockedStake);
  const compRate = completionRate(agent.completed, agent.failed);

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-surface border border-line rounded-xl p-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-xl font-bold text-primary">⚡ {displayName}</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                isActive
                  ? "bg-emerald/10 text-emerald border-emerald/20"
                  : "bg-danger/10 text-danger border-danger/20"
              }`}
            >
              {isActive ? "Active" : "Suspended"}
            </span>
          </div>
          <p className="text-muted font-mono text-xs break-all">{agent.owner}</p>
          <p className="text-secondary text-xs mt-1">{compRate}% completion rate</p>
        </div>
        <Link
          href={`/agents/${agent.owner}`}
          className="shrink-0 text-sm text-info hover:opacity-80 transition-opacity font-medium"
        >
          Full Profile →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashStat label="Total Staked" value={`${formatSol(agent.stake)} SOL`} />
        <DashStat
          label="Locked in Jobs"
          value={`${formatSol(agent.lockedStake)} SOL`}
        />
        <DashStat
          label="Available to Withdraw"
          value={`${formatSol(availableLamports.toString())} SOL`}
          accent
        />
        <DashStat
          label="Reputation"
          value={reputationDisplay(agent.reputation)}
          colorClass={repColorClass(agent.reputation)}
        />
        <DashStat label="Completed" value={String(agent.completed)} />
        <DashStat
          label="Failed"
          value={String(agent.failed)}
          danger={agent.failed > 0}
        />
        <DashStat label="Total Earned" value={`${formatSol(agent.totalEarned)} SOL`} />
        <DashStat
          label="Total Slashed"
          value={`${formatSol(agent.totalSlashed)} SOL`}
          danger={Number(agent.totalSlashed) > 0}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary font-semibold">My Active Jobs</h3>
          <span className="text-muted text-xs">{activeJobs.length} jobs</span>
        </div>
        {activeJobs.length === 0 ? (
          <EmptyState
            icon="🤖"
            message="No active jobs"
            sub="Jobs assigned to this agent will appear here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {activeJobs.map((job) => (
              <JobCard key={job.pubkey} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserView({
  pubkey,
  postedJobs,
}: {
  pubkey: string;
  postedJobs: SerializedJob[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="bg-surface border border-line rounded-xl p-6">
        <p className="text-muted text-xs mb-1">No agent registered for</p>
        <p className="font-mono text-primary text-sm break-all">{pubkey}</p>
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="bg-emerald text-bg font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Register as Agent
          </Link>
          <Link
            href="/post"
            className="border border-line text-secondary px-4 py-2 rounded-lg hover:border-line-active hover:text-primary transition-colors text-sm"
          >
            Post a Job
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary font-semibold">My Posted Jobs</h3>
          <span className="text-muted text-xs">{postedJobs.length} jobs</span>
        </div>
        {postedJobs.length === 0 ? (
          <EmptyState
            icon="📋"
            message="No posted jobs"
            sub="Jobs you post will appear here once submitted on-chain."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {postedJobs.map((job) => (
              <JobCard key={job.pubkey} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashStat({
  label,
  value,
  accent,
  danger,
  colorClass,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  colorClass?: string;
}) {
  return (
    <div
      className={`bg-surface border rounded-xl p-4 ${
        accent ? "border-emerald/30" : "border-line"
      }`}
    >
      <p className="text-muted text-xs mb-1">{label}</p>
      <p
        className={`font-mono font-semibold text-sm ${
          danger ? "text-danger" : colorClass ?? "text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  message,
  sub,
}: {
  icon: string;
  message: string;
  sub: string;
}) {
  return (
    <div className="text-center py-12 bg-surface border border-line rounded-xl">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-secondary font-medium mb-1">{message}</p>
      <p className="text-muted text-sm">{sub}</p>
    </div>
  );
}
