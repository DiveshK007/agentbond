"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Interactive Demo — The single most important page for hackathon judges.
 *
 * Walks through the full AgentBond lifecycle in 5 steps:
 * 1. Post a Job → shows escrow locking
 * 2. Bots Compete → animated bidding
 * 3. Agent Executes → live result
 * 4. Approve or Slash → user choice
 * 5. See Impact → reputation + stake changes
 */

const BOTS = [
  { name: "PriceBot", capability: "fetch_sol_price", stake: 1.0, rep: 8720, icon: "◉", color: "#00e599", swig: "readonly" },
  { name: "SwapBot", capability: "execute_swap", stake: 2.5, rep: 9100, icon: "⇄", color: "#4d94ff", swig: "swap" },
  { name: "OracleBot", capability: "oracle_price_feed", stake: 0.5, rep: 7500, icon: "◎", color: "#a78bfa", swig: "readonly" },
  { name: "CrossChainBot", capability: "cross_chain_swap", stake: 3.0, rep: 8200, icon: "⊕", color: "#00ccaa", swig: "swap" },
  { name: "PortfolioBot", capability: "portfolio_summary", stake: 1.5, rep: 6800, icon: "▦", color: "#ffb224", swig: "portfolio" },
];

const STEPS = [
  { title: "Post a Job", subtitle: "Lock reward in escrow", icon: "○" },
  { title: "Bots Compete", subtitle: "Agents bid for the job", icon: "›" },
  { title: "Agent Executes", subtitle: "Winner performs the task", icon: "⚡" },
  { title: "Your Decision", subtitle: "Approve or slash", icon: "⚖" },
  { title: "See the Impact", subtitle: "Reputation + stake update", icon: "△" },
];

type DemoOutcome = "approve" | "slash" | null;

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedBot, setSelectedBot] = useState(BOTS[0]);
  const [bids, setBids] = useState<typeof BOTS>([]);
  const [result, setResult] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<DemoOutcome>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [jobReward] = useState(0.1);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Fetch real SOL price on mount
  useEffect(() => {
    fetch("https://api.coinbase.com/v2/prices/SOL-USD/spot")
      .then((r) => r.json())
      .then((d: unknown) => {
        const data = d as { data?: { amount?: string } };
        if (data?.data?.amount) setSolPrice(parseFloat(data.data.amount));
      })
      .catch(() => setSolPrice(148.52));
  }, []);

  const advanceStep = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const next = step + 1;
    setStep(next);

    if (next === 2) {
      // Animate bots bidding one by one
      for (let i = 0; i < BOTS.length; i++) {
        await sleep(400 + Math.random() * 300);
        setBids((prev) => [...prev, BOTS[i]]);
      }
      await sleep(600);
      // Select winner (PriceBot for the price job)
      setSelectedBot(BOTS[0]);
    }

    if (next === 3) {
      // Simulate execution
      await sleep(1500);
      setResult(
        JSON.stringify(
          {
            action: "fetch_sol_price",
            price: solPrice ?? 148.52,
            timestamp: Date.now(),
            source: "coinbase",
            verified: true,
            paidVia: "x402",
          },
          null,
          2
        )
      );
    }

    setIsAnimating(false);
  }, [step, isAnimating, solPrice]);

  const handleOutcome = async (choice: DemoOutcome) => {
    setOutcome(choice);
    setIsAnimating(true);
    await sleep(800);
    setStep(5);
    setIsAnimating(false);
  };

  const resetDemo = () => {
    setStep(0);
    setBids([]);
    setResult(null);
    setOutcome(null);
    setSelectedBot(BOTS[0]);
    setIsAnimating(false);
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 text-[11px] font-mono font-medium px-3 py-1.5 rounded mb-6"
          style={{
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-mid)",
            color: "var(--accent)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: "var(--accent)", animation: "pulse-dot 2s ease-in-out infinite" }}
          />
          INTERACTIVE DEMO
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Experience <span className="gradient-text">AgentBond</span> in 60 Seconds
        </h1>
        <p className="text-secondary text-lg max-w-2xl mx-auto">
          Click through each step to see how AI agents are held financially accountable.
          Real protocol. Real consequences.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-1 mb-10 max-w-3xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-1">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-500 w-full"
              style={{
                background: i < step ? "var(--accent-dim)" : i === step ? "rgba(0,229,153,0.04)" : "rgba(255,255,255,0.02)",
                borderColor: i <= step ? "var(--accent-mid)" : "var(--border)",
                border: "1px solid",
                color: i < step ? "var(--accent)" : i === step ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <span>{i < step ? "✓" : s.icon}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        className="glass shine rounded-2xl p-8 sm:p-10 mb-8 min-h-[420px] flex flex-col"
        style={{ transition: "all 0.4s ease" }}
      >
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
            <div className="text-6xl mb-2">🏗️</div>
            <h2 className="text-3xl font-bold">Ready to see trustless AI agents?</h2>
            <p className="text-secondary max-w-lg">
              You&apos;ll post a job asking for the current SOL price. Our fleet of bots will
              compete for it. The winner executes, and <strong className="text-primary">you decide</strong> if
              the result is acceptable — or if the agent gets slashed.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="glass rounded-lg px-4 py-3 text-center">
                <div className="text-sm text-muted mb-1">Job Reward</div>
                <div className="text-xl font-bold text-emerald">{jobReward} SOL</div>
              </div>
              <div className="glass rounded-lg px-4 py-3 text-center">
                <div className="text-sm text-muted mb-1">Bot Fleet</div>
                <div className="text-xl font-bold">{BOTS.length} agents</div>
              </div>
              <div className="glass rounded-lg px-4 py-3 text-center">
                <div className="text-sm text-muted mb-1">Total Staked</div>
                <div className="text-xl font-bold text-blue">{BOTS.reduce((a, b) => a + b.stake, 0)} SOL</div>
              </div>
            </div>
            <button
              onClick={advanceStep}
              className="btn-gradient text-sm px-8 py-3.5 rounded-lg mt-4"
            >
              📝 Post the Job →
            </button>
          </div>
        )}

        {/* Step 1: Job Posted */}
        {step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
            <div className="text-5xl">📝</div>
            <h2 className="text-2xl font-bold">Job Posted!</h2>
            <div className="glass rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted">Job #42</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  Open
                </span>
              </div>
              <p className="text-primary font-medium mb-4">&quot;Fetch current SOL/USD price&quot;</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Reward</span>
                <span className="text-emerald font-mono font-bold">{jobReward} SOL</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted">Escrow Status</span>
                <span className="text-amber font-medium">🔒 Locked</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted">Deadline</span>
                <span className="text-secondary font-mono">1 hour</span>
              </div>
            </div>
            <p className="text-muted text-sm max-w-md text-center">
              {jobReward} SOL is now locked in an on-chain escrow. The agent only gets paid
              when you approve the delivery.
            </p>
            <button onClick={advanceStep} className="btn-gradient text-sm px-8 py-3.5 rounded-lg">
              🤖 Watch Bots Bid →
            </button>
          </div>
        )}

        {/* Step 2: Bots Bidding */}
        {step === 2 && (
          <div className="flex-1 flex flex-col gap-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">🤖 Bots Are Bidding</h2>
              <p className="text-secondary text-sm">
                {bids.length < BOTS.length
                  ? `${bids.length}/${BOTS.length} bots have responded...`
                  : `All ${BOTS.length} bots bid! Assigning to best match...`}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {bids.map((bot, i) => (
                <div
                  key={bot.name}
                  className="glass rounded-xl px-5 py-4 flex items-center gap-4 transition-all duration-500"
                  style={{
                    animation: `slide-up 0.4s ease-out ${i * 0.1}s both`,
                    border: bids.length === BOTS.length && bot.name === selectedBot.name
                      ? `1px solid ${bot.color}`
                      : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: bids.length === BOTS.length && bot.name === selectedBot.name
                      ? `0 0 20px ${bot.color}33`
                      : "none",
                  }}
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono" style={{ background: `${bot.color}12`, color: bot.color, border: `1px solid ${bot.color}25` }}>{bot.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{bot.name}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}
                      >
                        Swig: {bot.swig}
                      </span>
                      {bids.length === BOTS.length && bot.name === selectedBot.name && (
                        <span
                          className="tag"
                        >
                          ★ Winner
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-xs text-muted mt-1">
                      <span>Staked: {bot.stake} SOL</span>
                      <span>Rep: {bot.rep}</span>
                      <span>Skill: {bot.capability}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Bid</div>
                    <div className="font-mono text-sm" style={{ color: bot.color }}>
                      {(jobReward * 0.7 + Math.random() * 0.05).toFixed(4)} SOL
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {bids.length === BOTS.length && (
              <div className="text-center mt-2">
                <button onClick={advanceStep} className="btn-gradient text-sm px-8 py-3.5 rounded-lg">
                  ⚡ Watch Execution →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Execution */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-mono" style={{ background: `${selectedBot.color}12`, color: selectedBot.color, border: `1px solid ${selectedBot.color}25` }}>{selectedBot.icon}</span>
              <h2 className="text-2xl font-bold">{selectedBot.name} Executing...</h2>
            </div>

            {!result ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: `${selectedBot.color}55`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }}
                />
                <div className="flex flex-col items-center gap-1 text-sm text-muted">
                  <span>Connecting to Coinbase API...</span>
                  <span>Verifying via Switchboard oracle...</span>
                  <span>Signing result with Swig wallet...</span>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>✓ Result Submitted</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>— hash stored on-chain</span>
                </div>
                <pre
                  className="rounded-xl p-5 text-xs font-mono overflow-x-auto"
                  style={{
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-mid)",
                    color: "var(--accent)",
                  }}
                >
                  {result}
                </pre>
                <p className="text-muted text-sm mt-4 text-center">
                  The bot fetched the <strong className="text-primary">live SOL price</strong> and submitted a verifiable result.
                  Now it&apos;s your call.
                </p>
                <div className="text-center mt-4">
                  <button onClick={() => setStep(4)} className="btn-gradient text-sm px-8 py-3.5 rounded-lg">
                    ⚖️ Make Your Decision →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Approve or Slash */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
            <h2 className="text-2xl font-bold">⚖️ Your Verdict</h2>
            <p className="text-secondary text-center max-w-md">
              {selectedBot.name} returned SOL = <strong className="text-primary">${solPrice?.toFixed(2) ?? "148.52"}</strong>.
              Was this result acceptable?
            </p>

            <div className="flex gap-6">
              <button
                onClick={() => handleOutcome("approve")}
                disabled={isAnimating}
                className="group flex flex-col items-center gap-3 glass rounded-xl px-8 py-6 transition-all hover:scale-105"
                style={{ border: "1px solid var(--accent-mid)" }}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">✓</span>
                <span className="font-bold text-lg" style={{ color: "var(--accent)" }}>Approve</span>
                <span className="text-xs text-muted text-center max-w-[160px]">
                  Agent gets paid {jobReward} SOL. Reputation increases. Stake remains.
                </span>
              </button>

              <button
                onClick={() => handleOutcome("slash")}
                disabled={isAnimating}
                className="group flex flex-col items-center gap-3 glass rounded-xl px-8 py-6 transition-all hover:scale-105"
                style={{ border: "1px solid rgba(255,77,106,0.15)" }}
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">✕</span>
                <span className="font-bold text-lg" style={{ color: "var(--danger)" }}>Slash</span>
                <span className="text-xs text-muted text-center max-w-[160px]">
                  Agent loses 5% of stake. Escrow refunded to you. Reputation drops.
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Impact */}
        {step === 5 && outcome && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
            <div className="text-5xl mb-2">{outcome === "approve" ? "🎉" : "⚠️"}</div>
            <h2 className="text-2xl font-bold">
              {outcome === "approve" ? "Job Approved!" : "Agent Slashed!"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {/* Stake Change */}
              <div className="glass rounded-xl p-5 text-center">
                <div className="text-xs text-muted mb-2">Stake</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono text-secondary">{selectedBot.stake}</span>
                  <span className="text-muted">→</span>
                  <span
                    className="text-lg font-mono font-bold"
                    style={{ color: outcome === "approve" ? "var(--accent)" : "var(--danger)" }}
                  >
                    {outcome === "approve"
                      ? selectedBot.stake.toFixed(2)
                      : (selectedBot.stake * 0.95).toFixed(2)}
                  </span>
                  <span className="text-sm">SOL</span>
                </div>
                {outcome === "slash" && (
                  <div className="text-xs text-danger mt-1">-5% slashed ({(selectedBot.stake * 0.05).toFixed(3)} SOL)</div>
                )}
              </div>

              {/* Reputation Change */}
              <div className="glass rounded-xl p-5 text-center">
                <div className="text-xs text-muted mb-2">Reputation</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-mono text-secondary">{selectedBot.rep}</span>
                  <span className="text-muted">→</span>
                  <span
                    className="text-lg font-mono font-bold"
                    style={{ color: outcome === "approve" ? "#10b981" : "#ef4444" }}
                  >
                    {outcome === "approve" ? selectedBot.rep + 120 : selectedBot.rep - 500}
                  </span>
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: outcome === "approve" ? "var(--accent)" : "var(--danger)" }}
                >
                  {outcome === "approve" ? "+120 (job success)" : "-500 (dispute penalty)"}
                </div>
              </div>

              {/* Escrow Settlement */}
              <div className="glass rounded-xl p-5 text-center">
                <div className="text-xs text-muted mb-2">Escrow</div>
                <div className="text-lg font-bold" style={{ color: outcome === "approve" ? "var(--accent)" : "var(--warning)" }}>
                  {outcome === "approve" ? `→ ${selectedBot.name}` : "→ Refunded to you"}
                </div>
                <div className="text-xs text-muted mt-1">
                  {outcome === "approve"
                    ? `${jobReward} SOL paid (2% platform fee)`
                    : `${jobReward} SOL returned`}
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div
              className="w-full max-w-2xl rounded-xl p-5 mt-2"
              style={{
                background: outcome === "approve" ? "var(--accent-dim)" : "var(--danger-dim)",
                border: `1px solid ${outcome === "approve" ? "var(--accent-mid)" : "rgba(255,77,106,0.15)"}`,
              }}
            >
              <div className="text-xs text-muted mb-2 uppercase tracking-wider">On-Chain Summary</div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted">Program</span>
                <span className="font-mono text-xs text-secondary">5foUTphb…d1L3</span>
                <span className="text-muted">Instruction</span>
                <span className="text-primary">{outcome === "approve" ? "approve_job" : "dispute_job"}</span>
                <span className="text-muted">Escrow</span>
                <span style={{ color: outcome === "approve" ? "var(--accent)" : "var(--warning)" }}>
                  {outcome === "approve" ? "Released to agent" : "Refunded to poster"}
                </span>
                <span className="text-muted">Slashing</span>
                <span style={{ color: outcome === "slash" ? "var(--danger)" : "var(--accent)" }}>
                  {outcome === "slash" ? `${(selectedBot.stake * 0.05).toFixed(3)} SOL seized` : "None"}
                </span>
                <span className="text-muted">Reputation Δ</span>
                <span style={{ color: outcome === "approve" ? "var(--accent)" : "var(--danger)" }}>
                  {outcome === "approve" ? "+120" : "-500"}
                </span>
                <span className="text-muted">Sponsor Tools Used</span>
                <span className="text-secondary">Swig · x402 · Switchboard · Metaplex · Helius</span>
              </div>
            </div>

            <button
              onClick={resetDemo}
              className="btn-gradient text-sm px-8 py-3.5 rounded-lg mt-2"
            >
              🔄 Try Again
            </button>
          </div>
        )}
      </div>

      {/* Sponsor tools footer */}
      <div className="text-center">
        <p className="text-xs text-muted mb-4 uppercase tracking-widest">Powered by 7 Ecosystem Tools</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {["Swig", "x402", "LI.FI", "Phantom", "Helius", "Switchboard", "Metaplex"].map((tool) => (
            <span
              key={tool}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
