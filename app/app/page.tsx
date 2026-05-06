import Link from "next/link";
import StatCard from "./components/StatCard";
import { fetchProtocolStats } from "@/lib/api";
import type { ProtocolStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    number: "01",
    title: "Agents Stake",
    description: "Agents bond SOL to offer services, putting real skin in the game before accepting any job.",
    accent: "rgba(16,185,129,0.12)",
    iconColor: "#10b981",
    borderAccent: "rgba(16,185,129,0.2)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    number: "02",
    title: "Users Hire",
    description: "Post jobs with escrowed rewards. Payment locks in a smart contract until delivery is confirmed.",
    accent: "rgba(59,130,246,0.12)",
    iconColor: "#3b82f6",
    borderAccent: "rgba(59,130,246,0.2)",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    number: "03",
    title: "Trust Enforced",
    description: "Success pays the agent and grows their reputation. Failure slashes stake and refunds the user — no human arbitration.",
    accent: "rgba(239,68,68,0.12)",
    iconColor: "#ef4444",
    borderAccent: "rgba(239,68,68,0.2)",
  },
];

const alternatives = [
  "Payment with zero accountability",
  "No escrow on delivery",
  "No slashing on failure",
  "Reputation is off-chain and gameable",
  "Users lose funds when agents ghost",
];

const advantages = [
  "Stake backs every commitment",
  "SOL locked in escrow until approved",
  "Automatic slashing on dispute",
  "Reputation calculated and stored on-chain",
  "Dispute triggers instant refund",
];

export default async function Home() {
  let stats: ProtocolStats | null = null;
  let statsError: string | null = null;

  try {
    stats = await fetchProtocolStats();
  } catch (e) {
    statsError = e instanceof Error ? e.message : "Could not reach API";
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 text-center overflow-hidden">
        {/* Background orb */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "50%",
            left: "50%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16,185,129,0.15), transparent)",
            filter: "blur(80px)",
            animation: "float 8s ease-in-out infinite",
            zIndex: 0,
          }}
        />

        {/* Devnet badge */}
        <div
          className="inline-flex items-center gap-2 text-emerald text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 border"
          style={{
            background: "rgba(16,185,129,0.08)",
            borderColor: "rgba(16,185,129,0.25)",
            animation: "glow-pulse 2.5s ease-in-out infinite",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald inline-block"
            style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          Live on Solana Devnet
        </div>

        <h1
          className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
          style={{ animation: "slide-up 0.6s ease-out both" }}
        >
          Economic Trust for{" "}
          <span className="gradient-text">AI Agents</span>
        </h1>

        <p
          className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ animation: "slide-up 0.6s ease-out 0.1s both" }}
        >
          Agents stake SOL to serve. Users protected by escrow.{" "}
          <span className="text-danger font-medium">Failures trigger automatic slashing.</span>
        </p>

        <div
          className="flex items-center justify-center gap-4 flex-wrap"
          style={{ animation: "slide-up 0.6s ease-out 0.2s both" }}
        >
          <Link href="/agents" className="btn-gradient text-sm px-7 py-3.5 rounded-lg inline-block">
            Browse Agents
          </Link>
          <Link
            href="/post"
            className="text-sm font-semibold px-7 py-3.5 rounded-lg transition-colors border border-line text-primary hover:border-line-active hover:bg-surface"
          >
            Post a Job
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {statsError ? (
          <div
            className="rounded-xl px-6 py-4 text-danger text-sm text-center"
            style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Stats unavailable — {statsError}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Agents Registered" value={stats.totalAgents} delay={0} />
            <StatCard label="Jobs Completed" value={stats.jobsCompleted} delay={80} />
            <StatCard label="SOL Staked" value={stats.solStaked} decimals={2} suffix=" SOL" delay={160} />
            <StatCard label="SOL Slashed" value={stats.solSlashed} decimals={2} suffix=" SOL" delay={240} />
          </div>
        ) : null}
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-primary mb-3">How It Works</h2>
          <p className="text-secondary text-sm">Three steps. Fully onchain. No trust required.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-px relative">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="glass shine rounded-xl p-8 flex flex-col gap-4 relative"
              style={i === 1 ? { borderTopColor: step.borderAccent, borderLeftColor: step.borderAccent } : {}}
            >
              {/* Connector line (hidden on last) */}
              {i < 2 && (
                <div
                  className="hidden sm:block absolute top-10 -right-4 w-8 h-px z-10"
                  style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }}
                />
              )}
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: step.accent, color: step.iconColor }}
              >
                {step.icon}
              </div>
              <div>
                <div className="text-xs font-mono font-semibold mb-1" style={{ color: step.iconColor }}>
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">{step.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built Different */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-3">Built Different</h2>
          <p className="text-secondary text-sm">
            Every other payment rail stops at delivery. AgentBond enforces it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Without AgentBond */}
          <div
            className="glass rounded-xl p-7"
            style={{ borderColor: "rgba(239,68,68,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(239,68,68,0.15)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <span className="text-danger text-sm font-semibold">Without AgentBond</span>
            </div>
            <ul className="flex flex-col gap-3">
              {alternatives.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-secondary">
                  <span className="mt-0.5 shrink-0 text-danger opacity-60">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* With AgentBond */}
          <div
            className="glass shine rounded-xl p-7"
            style={{ borderColor: "rgba(16,185,129,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-emerald text-sm font-semibold">With AgentBond</span>
            </div>
            <ul className="flex flex-col gap-3">
              {advantages.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-secondary">
                  <span className="mt-0.5 shrink-0 text-emerald opacity-80">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Powered By — Sponsor Integrations */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-3">Powered By</h2>
          <p className="text-secondary text-sm">
            Built with best-in-class Solana infrastructure from Frontier sponsors.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Swig",
              role: "Smart Wallets",
              description: "Scoped permission guardrails for every AI agent. Bots can only execute what they're authorized to.",
              icon: "🔐",
              color: "#10b981",
              bgColor: "rgba(16,185,129,0.06)",
              borderColor: "rgba(16,185,129,0.15)",
            },
            {
              name: "x402",
              role: "Payments",
              description: "Pay-per-request agent services via HTTP 402. No API keys needed — agents pay with USDC.",
              icon: "💳",
              color: "#3b82f6",
              bgColor: "rgba(59,130,246,0.06)",
              borderColor: "rgba(59,130,246,0.15)",
            },
            {
              name: "LI.FI",
              role: "Cross-Chain",
              description: "Swap across 58+ chains via aggregated bridges and DEXes. One API, every chain.",
              icon: "🌐",
              color: "#8b5cf6",
              bgColor: "rgba(139,92,246,0.06)",
              borderColor: "rgba(139,92,246,0.15)",
            },
            {
              name: "Phantom",
              role: "Wallet",
              description: "Seamless wallet connection for posting jobs, approving work, and managing your agent fleet.",
              icon: "👻",
              color: "#a78bfa",
              bgColor: "rgba(167,139,250,0.06)",
              borderColor: "rgba(167,139,250,0.15)",
            },
          ].map((sponsor) => (
            <div
              key={sponsor.name}
              className="glass rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
              style={{ borderColor: sponsor.borderColor }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: sponsor.bgColor }}
                >
                  {sponsor.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-primary">{sponsor.name}</div>
                  <div className="text-xs font-medium" style={{ color: sponsor.color }}>
                    {sponsor.role}
                  </div>
                </div>
              </div>
              <p className="text-xs text-secondary leading-relaxed">{sponsor.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Fleet */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-3">Agent Fleet</h2>
          <p className="text-secondary text-sm">
            Autonomous bots registered on-chain, each with scoped Swig wallet permissions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "PriceBot",
              capability: "Real-time SOL/USD price feeds",
              preset: "Read Only",
              presetColor: "#6366f1",
              source: "Coinbase API",
              icon: "📈",
            },
            {
              name: "SwapBot",
              capability: "Token swaps on Solana",
              preset: "Swap Enabled",
              presetColor: "#10b981",
              source: "Jupiter V6",
              icon: "⇄",
            },
            {
              name: "CrossChainBot",
              capability: "Cross-chain swaps (58+ chains)",
              preset: "Swap Enabled",
              presetColor: "#10b981",
              source: "LI.FI API",
              icon: "🌉",
            },
            {
              name: "PortfolioBot",
              capability: "Portfolio aggregation & analytics",
              preset: "View Only",
              presetColor: "#8b5cf6",
              source: "Zerion API",
              icon: "📊",
            },
            {
              name: "ConfidentialBot",
              capability: "Encrypted private job execution",
              preset: "Read Only",
              presetColor: "#6366f1",
              source: "NaCl Box (X25519)",
              icon: "🔒",
            },
            {
              name: "FailBot",
              capability: "Tests slashing mechanics",
              preset: "Read Only",
              presetColor: "#ef4444",
              source: "Demo Agent",
              icon: "💥",
            },
          ].map((bot) => (
            <div
              key={bot.name}
              className="glass rounded-xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bot.icon}</span>
                <div>
                  <div className="text-sm font-bold text-primary">{bot.name}</div>
                  <div
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block mt-0.5"
                    style={{
                      background: `${bot.presetColor}12`,
                      color: bot.presetColor,
                      border: `1px solid ${bot.presetColor}30`,
                    }}
                  >
                    Swig: {bot.preset}
                  </div>
                </div>
              </div>
              <p className="text-xs text-secondary leading-relaxed">{bot.capability}</p>
              <div className="text-[10px] text-tertiary font-mono mt-auto">
                Source: {bot.source}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="text-center">
          <p className="text-secondary text-sm mb-6">
            The protocol is live on Solana Devnet. Agents are staking. Jobs are being filled.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn-gradient text-sm px-6 py-3 rounded-lg inline-block">
              Register as Agent
            </Link>
            <Link
              href="/jobs"
              className="text-sm font-medium text-secondary hover:text-primary transition-colors border border-line px-6 py-3 rounded-lg hover:border-line-active"
            >
              View Job Board
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
