"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Agent, SerializedJob } from "@/lib/types";
import { fetchAgent as apiFetchAgent, fetchJobs as apiFetchJobs } from "@/lib/api";
import {
  agentDisplayName,
  completionRate,
  formatSol,
  repColorClass,
  reputationDisplay,
} from "@/lib/format";
import JobCard from "../components/JobCard";

type AgentState = Agent | false | null;

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const [inputValue, setInputValue] = useState("");
  const [walletPubkey, setWalletPubkey] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentState>(null);
  const [jobs, setJobs] = useState<SerializedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLookup = useCallback(async (pubkey: string) => {
    setLoading(true);
    setError(null);
    setAgent(null);
    setJobs([]);

    try {
      const [agentData, jobsData] = await Promise.all([
        apiFetchAgent(pubkey),
        apiFetchJobs(),
      ]);

      // fetchAgent always returns data (falls back to demo) —
      // check if the returned agent actually matches the queried pubkey
      const isMatch =
        agentData.pubkey === pubkey || agentData.owner === pubkey;
      setAgent(isMatch ? agentData : false);
      setJobs(jobsData);
      setWalletPubkey(pubkey);
    } catch {
      setError("Could not load agent data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load when wallet connects
  useEffect(() => {
    if (publicKey) {
      const pk = publicKey.toBase58();
      setInputValue(pk);
      doLookup(pk);
    }
  }, [publicKey, doLookup]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const pubkey = inputValue.trim();
    if (!pubkey) return;
    doLookup(pubkey);
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
          placeholder="Solana wallet pubkey (base58)…"
          spellCheck={false}
          className="input-glass flex-1 font-mono"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="btn-gradient shrink-0 text-sm px-5 py-2.5 rounded-lg"
        >
          {loading ? "Looking up…" : "Look Up"}
        </button>
      </form>

      {error && (
        <div
          className="rounded-xl px-6 py-4 text-danger text-sm mb-8"
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div
            className="inline-block w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: "rgba(255,255,255,0.1)", borderTopColor: "#10b981" }}
          />
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

function AgentView({ agent, activeJobs }: { agent: Agent; activeJobs: SerializedJob[] }) {
  const displayName = agentDisplayName(agent.name, agent.owner);
  const isActive = agent.status === 0;
  const availableLamports = Number(agent.stake) - Number(agent.lockedStake);
  const compRate = completionRate(agent.completed, agent.failed);

  return (
    <div className="flex flex-col gap-8">
      <div className="glass shine rounded-xl p-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-xl font-bold text-primary">{displayName}</h2>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium border"
              style={
                isActive
                  ? { background: "rgba(16,185,129,0.1)", color: "#10b981", borderColor: "rgba(16,185,129,0.2)" }
                  : { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }
              }
            >
              {isActive ? "Active" : "Suspended"}
            </span>
          </div>
          <p className="text-muted font-mono text-xs break-all">{agent.owner}</p>
          <p className="text-muted text-xs mt-1">{compRate}% completion rate</p>
        </div>
        <Link
          href={`/agents/${agent.owner}`}
          className="shrink-0 text-sm text-emerald hover:opacity-80 transition-opacity font-medium"
        >
          Full Profile →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashStat label="Total Staked" value={`${formatSol(agent.stake)} SOL`} />
        <DashStat label="Locked in Jobs" value={`${formatSol(agent.lockedStake)} SOL`} />
        <DashStat label="Available" value={`${formatSol(availableLamports.toString())} SOL`} accent />
        <DashStat
          label="Reputation"
          value={reputationDisplay(agent.reputation)}
          colorStyle={repColorClass(agent.reputation)}
        />
        <DashStat label="Completed" value={String(agent.completed)} />
        <DashStat label="Failed" value={String(agent.failed)} danger={agent.failed > 0} />
        <DashStat label="Total Earned" value={`${formatSol(agent.totalEarned)} SOL`} />
        <DashStat
          label="Total Slashed"
          value={`${formatSol(agent.totalSlashed)} SOL`}
          danger={Number(agent.totalSlashed) > 0}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-primary font-semibold text-sm">Active Jobs</h3>
          <span className="text-muted text-xs">{activeJobs.length}</span>
        </div>
        {activeJobs.length === 0 ? (
          <EmptyState message="No active jobs" sub="Jobs assigned to this agent will appear here." />
        ) : (
          <div className="flex flex-col gap-3">
            {activeJobs.map((job) => <JobCard key={job.pubkey} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function UserView({ pubkey, postedJobs }: { pubkey: string; postedJobs: SerializedJob[] }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="glass rounded-xl p-6">
        <p className="text-muted text-xs mb-1">No agent registered for</p>
        <p className="font-mono text-primary text-sm break-all">{pubkey}</p>
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <Link href="/register" className="btn-gradient text-sm px-4 py-2 rounded-lg inline-block">
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
          <h3 className="text-primary font-semibold text-sm">Posted Jobs</h3>
          <span className="text-muted text-xs">{postedJobs.length}</span>
        </div>
        {postedJobs.length === 0 ? (
          <EmptyState message="No posted jobs" sub="Jobs you post on-chain will appear here." />
        ) : (
          <div className="flex flex-col gap-3">
            {postedJobs.map((job) => <JobCard key={job.pubkey} job={job} />)}
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
  colorStyle,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
  colorStyle?: string;
}) {
  return (
    <div
      className="glass rounded-xl p-4"
      style={accent ? { borderColor: "rgba(16,185,129,0.2)" } : {}}
    >
      <p className="text-muted text-xs mb-1">{label}</p>
      <p
        className={`font-mono font-semibold text-sm ${colorStyle ?? ""}`}
        style={danger ? { color: "#ef4444" } : !colorStyle ? { color: "var(--text-primary)" } : {}}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="glass text-center py-12 rounded-xl">
      <p className="text-secondary font-medium mb-1 text-sm">{message}</p>
      <p className="text-muted text-xs">{sub}</p>
    </div>
  );
}
