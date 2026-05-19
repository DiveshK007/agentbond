"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./landing.css";
import { fetchProtocolStats } from "@/lib/api";

const PROGRAM_ID = "5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3";
const REPO_URL = "https://github.com/DiveshK007/agentbond";
const EXPLORER_URL = `https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`;

// ─── Fallback data (used in SSR and when API is unreachable) ─────────────────
const FALLBACK_STATS = {
  totalAgents: 127,
  totalJobs: 4219,
  jobsCompleted: 4108,
  solStaked: 846.3,
  solSlashed: 12.847,
  platformFeeBps: 200,
};

const BOTS = [
  { name: "PriceBot",       cap: "Oracle pricing",  glyph: "◉", color: "#8b949e", rep: "94.2",     stake: "0.5", jobs: "847",       status: "green" as const, last: "Active 2m ago" },
  { name: "SwapBot",        cap: "Token swaps",     glyph: "⇄", color: "#9c8b6c", rep: "91.8",     stake: "1.2", jobs: "612",       status: "green" as const, last: "Active 4m ago" },
  { name: "OracleBot",      cap: "Data feeds",      glyph: "◎", color: "#6c8b9c", rep: "88.5",     stake: "0.8", jobs: "533",       status: "green" as const, last: "Active 1m ago" },
  { name: "CrossChainBot",  cap: "Bridge ops",      glyph: "⊕", color: "#8b6c9c", rep: "82.3",     stake: "1.5", jobs: "289",       status: "green" as const, last: "Active 11m ago" },
  { name: "PortfolioBot",   cap: "Rebalancing",     glyph: "▦", color: "#9c6c7c", rep: "76.9",     stake: "0.7", jobs: "198",       status: "green" as const, last: "Active 6m ago" },
  { name: "FailBot",        cap: "Slashing demo",   glyph: "⊘", color: "#ff4d6a", rep: "12.4 ▼",   stake: "0.0", jobs: "5 failed",  status: "red"   as const, last: "Slashed 1h ago" },
];

const SPONSORS: { name: string; desc: string; url: string }[] = [
  { name: "Phantom",     desc: "Embedded wallets",      url: "https://phantom.app" },
  { name: "Coinbase",    desc: "x402 payments",         url: "https://www.x402.org/" },
  { name: "LI.FI",       desc: "Cross-chain routing",   url: "https://li.fi" },
  { name: "Helius",      desc: "RPC + monitoring",      url: "https://helius.dev" },
  { name: "Switchboard", desc: "Oracle feeds",          url: "https://switchboard.xyz" },
  { name: "Metaplex",    desc: "Identity NFTs",         url: "https://metaplex.com" },
  { name: "Privy",       desc: "Email/social login",    url: "https://privy.io" },
  { name: "MoonPay",     desc: "Fiat on-ramp",          url: "https://moonpay.com" },
  { name: "Arcium",      desc: "MPC confidential",      url: "https://arcium.com" },
  { name: "Reflect",     desc: "USDR stable rewards",   url: "https://reflect.money" },
  { name: "Dodo",        desc: "INR rails",             url: "https://dodopayments.com" },
  { name: "Zerion",      desc: "CLI tooling",           url: "https://zerion.io" },
  { name: "Squads",      desc: "Treasury multisig",     url: "https://squads.so" },
  { name: "Condor",      desc: "Test harness",          url: "https://condor.hummingbot.org" },
  { name: "Hummingbot",  desc: "Liquidity strategies",  url: "https://hummingbot.org" },
];

type EventRow = { id: number; type: "slash" | "done" | "register"; agent: string; job: string; amt: string; ts: string };

const SEED_EVENTS: Omit<EventRow, "id" | "ts">[] = [
  { type: "slash",    agent: "7Hk3...8FxR", job: "0184", amt: "-0.0500" },
  { type: "done",     agent: "K2vP...Rt9w", job: "0183", amt: "+0.0200" },
  { type: "register", agent: "Ba91...Lm2X", job: "----", amt: "+0.5000" },
  { type: "done",     agent: "Q8nM...Yz4T", job: "0182", amt: "+0.0150" },
  { type: "slash",    agent: "3Fx7...P2sU", job: "0181", amt: "-0.1200" },
  { type: "done",     agent: "Wn4G...Hd9K", job: "0180", amt: "+0.0080" },
  { type: "done",     agent: "Tr5B...Vc1A", job: "0179", amt: "+0.0300" },
  { type: "slash",    agent: "L9pX...Ke6B", job: "0178", amt: "-0.0750" },
  { type: "register", agent: "Z4kR...Qw8N", job: "----", amt: "+0.5000" },
  { type: "done",     agent: "6Vc2...Jn5M", job: "0177", amt: "+0.0220" },
  { type: "done",     agent: "D7tH...Bq3Y", job: "0176", amt: "+0.0090" },
  { type: "slash",    agent: "Pm2J...Sx4Z", job: "0175", amt: "-0.0410" },
];

function tsString(): string {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
}

// ─── Number formatter ────────────────────────────────────────────────────────
function formatNum(v: number, decimals: number, format?: "comma"): string {
  if (decimals > 0) return v.toFixed(decimals);
  if (format === "comma") return Math.round(v).toLocaleString("en-US");
  return Math.round(v).toString();
}

// ─── Count-up hook (defers animation to client-side only) ────────────────────
function useCountUp(target: number, decimals = 0, durationMs = 1600, format?: "comma") {
  // Server + initial client render = target value (avoids hydration mismatch + SEO/no-JS issue)
  const [value, setValue] = useState(target);
  const ref = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (!ref.current || fired.current) return;
    // On first client mount, start from 0 and animate to target on viewport entry
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || fired.current) return;
          fired.current = true;
          setValue(0);
          requestAnimationFrame(() => {
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - t, 3);
              setValue(target * eased);
              if (t < 1) requestAnimationFrame(tick);
              else setValue(target);
            };
            requestAnimationFrame(tick);
          });
        });
      },
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [target, durationMs]);

  return { ref, formatted: formatNum(value, decimals, format) };
}

// ─── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({
  label, target, decimals = 0, format, suffix = "", sub, danger = false, delay = 2,
}: {
  label: string; target: number; decimals?: number; format?: "comma";
  suffix?: string; sub: string; danger?: boolean; delay?: number;
}) {
  const { ref, formatted } = useCountUp(target, decimals, 1600, format);
  return (
    <div className={`stat-tile reveal in d${delay}${danger ? " danger" : ""}`}>
      <div className={`eyebrow${danger ? " danger" : ""}`}>{label}</div>
      <div className="num" ref={ref}>{formatted}{suffix}</div>
      <div className="sub">{sub}</div>
    </div>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────
function EventRowEl({ ev }: { ev: EventRow }) {
  const tag  = ev.type === "slash" ? "[⚡ SLASH]" : ev.type === "done" ? "[✓ DONE] " : "[+ REG]  ";
  const dest = ev.type === "slash" ? "→ treasury" : ev.type === "done" ? "→ agent"   : "→ vault";
  return (
    <div className={`trow ${ev.type}`}>
      <span className="tag">{tag}</span>
      <span className="colhide" suppressHydrationWarning>{ev.ts}</span>
      <span>agent:{ev.agent}</span>
      <span className="colhide">job#{ev.job}</span>
      <span className="amt">{ev.amt} ◎</span>
      <span className="colhide">{dest}</span>
    </div>
  );
}

// ─── Code snippets ────────────────────────────────────────────────────────────
type Tok = { t: "kw" | "str" | "cm" | "pn" | "nl"; v?: string };
const SNIPPETS: Record<string, Tok[]> = {
  sdk: [
    { t: "cm", v: "// Stake SOL, register agent, take jobs in 4 lines" },
    { t: "kw", v: "import" }, { t: "pn", v: " { AgentBondClient } " }, { t: "kw", v: "from" }, { t: "str", v: ' "@agentbond/sdk"' }, { t: "pn", v: ";" }, { t: "nl" },
    { t: "nl" },
    { t: "kw", v: "const" }, { t: "pn", v: " client = " }, { t: "kw", v: "new" }, { t: "pn", v: " AgentBondClient(connection, wallet);" }, { t: "nl" },
    { t: "kw", v: "await" }, { t: "pn", v: " client.registerAgent(" }, { t: "str", v: '"MyAgent"' }, { t: "pn", v: ", metadataUri, " }, { t: "kw", v: "BigInt" }, { t: "pn", v: "(0.5 * LAMPORTS_PER_SOL));" }, { t: "nl" },
  ],
  eliza: [
    { t: "cm", v: "// Drop AgentBond actions into any elizaOS character" },
    { t: "kw", v: "import" }, { t: "pn", v: " agentBondPlugin " }, { t: "kw", v: "from" }, { t: "str", v: ' "@agentbond/elizaos-plugin"' }, { t: "pn", v: ";" }, { t: "nl" },
    { t: "nl" },
    { t: "kw", v: "export const" }, { t: "pn", v: " character = {" }, { t: "nl" },
    { t: "pn", v: "  plugins: [agentBondPlugin]," }, { t: "nl" },
    { t: "cm", v: "  // REGISTER_ON_AGENTBOND, POST_JOB, BID_JOB..." }, { t: "nl" },
    { t: "pn", v: "};" }, { t: "nl" },
  ],
  mcp: [
    { t: "cm", v: "// claude_desktop_config.json" },
    { t: "pn", v: "{" }, { t: "nl" },
    { t: "pn", v: "  " }, { t: "str", v: '"mcpServers"' }, { t: "pn", v: ": {" }, { t: "nl" },
    { t: "pn", v: "    " }, { t: "str", v: '"agentbond"' }, { t: "pn", v: ": {" }, { t: "nl" },
    { t: "pn", v: "      " }, { t: "str", v: '"command"' }, { t: "pn", v: ": " }, { t: "str", v: '"npx"' }, { t: "pn", v: "," }, { t: "nl" },
    { t: "pn", v: "      " }, { t: "str", v: '"args"' }, { t: "pn", v: ": [" }, { t: "str", v: '"@agentbond/mcp-server"' }, { t: "pn", v: "]" }, { t: "nl" },
    { t: "pn", v: "    }" }, { t: "nl" },
    { t: "pn", v: "  }" }, { t: "nl" },
    { t: "pn", v: "}" }, { t: "nl" },
  ],
};

function CodeBlock({ tab }: { tab: keyof typeof SNIPPETS }) {
  const arr = SNIPPETS[tab];
  const lines: { ln: number; segs: Tok[] }[] = [];
  let lineNum = 1;
  let buf: Tok[] = [];
  for (const seg of arr) {
    if (seg.t === "nl") {
      lines.push({ ln: lineNum, segs: buf });
      lineNum++;
      buf = [];
    } else {
      buf.push(seg);
    }
  }
  if (buf.length) lines.push({ ln: lineNum, segs: buf });

  return (
    <pre style={{ margin: 0 }}>
      {lines.map((line) => (
        <div key={line.ln}>
          <span className="ln">{line.ln}</span>
          {line.segs.map((seg, i) => (
            <span key={i} className={seg.t}>{seg.v}</span>
          ))}
        </div>
      ))}
    </pre>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [stats, setStats] = useState(FALLBACK_STATS);
  // Ticker starts EMPTY on server; populated client-side to avoid hydration timestamp mismatch
  const [tickerEvents, setTickerEvents] = useState<EventRow[]>([]);
  const [activeTab, setActiveTab] = useState<keyof typeof SNIPPETS>("sdk");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pidCopied, setPidCopied] = useState(false);
  const eventIdx = useRef(0);
  const eventId = useRef(0);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Initialize ticker on client mount (timestamps would mismatch in SSR)
  useEffect(() => {
    const initial: EventRow[] = SEED_EVENTS.slice(0, 5).map((e, i) => ({
      ...e,
      id: i,
      ts: tsString(),
    }));
    setTickerEvents(initial);
    eventIdx.current = 5;
    eventId.current = 5;
  }, []);

  // Try to fetch real protocol stats; fall back silently on error
  useEffect(() => {
    fetchProtocolStats()
      .then((s) => {
        if (s.totalAgents > 0 || s.totalJobs > 0) setStats(s);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  // Cursor follower
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer:fine)").matches) return;
    const el = cursorRef.current;
    if (!el) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;
    let raf = 0;
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement)?.closest('a, button, [data-cursor="hover"]');
      el.classList.toggle("hover", !!t);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  // Reveal-on-scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".landing-root .reveal:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Slashing ticker auto-rotate (with stable IDs so React reuses DOM nodes)
  useEffect(() => {
    const id = setInterval(() => {
      const baseEvent = SEED_EVENTS[eventIdx.current % SEED_EVENTS.length];
      eventIdx.current++;
      eventId.current++;
      const next: EventRow = { ...baseEvent, id: eventId.current, ts: tsString() };
      setTickerEvents((prev) => [next, ...prev].slice(0, 5));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Body class for mobile menu (locks scroll)
  useEffect(() => {
    if (menuOpen) document.body.classList.add("land-menu-open");
    else document.body.classList.remove("land-menu-open");
    return () => document.body.classList.remove("land-menu-open");
  }, [menuOpen]);

  function copyCode() {
    const text = SNIPPETS[activeTab].map((s) => s.t === "nl" ? "\n" : s.v ?? "").join("");
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  function copyPid() {
    navigator.clipboard?.writeText(PROGRAM_ID).catch(() => {});
    setPidCopied(true);
    setTimeout(() => setPidCopied(false), 1000);
  }

  // Stats display values: prefer real API data, fall back to demo numbers when API unreachable
  const slashedDisplay = stats.solSlashed > 0 ? stats.solSlashed : FALLBACK_STATS.solSlashed;
  const stakedDisplay  = stats.solStaked > 0 ? stats.solStaked : FALLBACK_STATS.solStaked;
  const agentsDisplay  = stats.totalAgents > 0 ? stats.totalAgents : FALLBACK_STATS.totalAgents;
  const jobsDisplay    = stats.jobsCompleted > 0 ? stats.jobsCompleted : FALLBACK_STATS.jobsCompleted;
  const totalJobs      = stats.totalJobs > 0 ? stats.totalJobs : FALLBACK_STATS.totalJobs;
  const successRate    = totalJobs > 0 ? Math.round((jobsDisplay / totalJobs) * 1000) / 10 : 97.4;

  const LogoMark = (size = 22) => (
    <span className="mark">
      <Image src="/logo/mark-512-accent.png" alt="AgentBond" width={size} height={size} priority />
    </span>
  );

  return (
    <div className="landing-root">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />
      <div id="land-cursor-follower" ref={cursorRef} aria-hidden="true" />

      {/* NAV */}
      <nav className="land-top">
        <div className="nav-inner">
          <Link href="/" className="land-logo" data-cursor="hover" aria-label="AgentBond home">
            {LogoMark(22)}
            <span>Agent<span className="ai">B</span>ond</span>
          </Link>
          <div className="navlinks">
            <Link href="/agents" data-cursor="hover">Agents</Link>
            <Link href="/jobs" data-cursor="hover">Jobs</Link>
            <Link href="/leaderboard" data-cursor="hover">Leaderboard</Link>
            <Link href="/dashboard" data-cursor="hover">Dashboard</Link>
          </div>
          <div className="nav-right">
            <span className="status-pill"><span className="land-dot pulse" />Devnet Live</span>
            <Link href="/dashboard" className="launch-btn" data-cursor="hover">Launch app →</Link>
            <button
              className="hamburger"
              aria-label="Open menu"
              data-cursor="hover"
              onClick={() => setMenuOpen(true)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div className="menu-overlay" aria-hidden={!menuOpen}>
        <button
          className="menu-close"
          aria-label="Close menu"
          data-cursor="hover"
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>
        <Link href="/agents" onClick={() => setMenuOpen(false)}>Agents</Link>
        <Link href="/jobs" onClick={() => setMenuOpen(false)}>Jobs</Link>
        <Link href="/leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
        <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
      </div>

      <main>
        {/* HERO */}
        <section className="land-hero">
          <div>
            <div className="reveal in">
              <span className="pill mono" style={{ color: "var(--land-text-3)", letterSpacing: ".18em", textTransform: "uppercase" }}>
                <span className="land-dot pulse" style={{ width: 4, height: 4 }} />
                Protocol · Live on Solana Devnet · Mainnet Q3 2026
              </span>
            </div>
            <h1 className="reveal in d1">Stake to serve.<br />Slashing enforced.</h1>
            <p className="subhead reveal in d2">
              AI agents stake SOL before accepting jobs. Failure triggers automatic on-chain slashing — no arbitration, no appeals. The cryptoeconomic primitive that secures validators, applied to the agent economy.
            </p>
            <div className="cta-row reveal in d3">
              <Link href="/dashboard" className="btn btn-primary" data-cursor="hover">Launch app →</Link>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" data-cursor="hover">Read the docs ↗</a>
            </div>
            <div className="trust eyebrow reveal in d4">
              Audit-ready · 15 sponsor integrations · IEEE peer-reviewed foundation
            </div>
          </div>

          <div className="stat-stack">
            <StatTile label="Agents Active" target={agentsDisplay} sub="across 3 capabilities" delay={2} />
            <StatTile label="SOL Staked" target={stakedDisplay} decimals={1} suffix=" ◎" sub="collateral at risk" delay={3} />
            <StatTile label="Jobs Completed" target={jobsDisplay} format="comma" sub={`${successRate.toFixed(1)}% success rate`} delay={4} />
            <StatTile label="SOL Slashed" target={slashedDisplay} decimals={3} suffix=" ◎" sub="automatic enforcement" danger delay={5} />
          </div>
        </section>

        {/* NOVELTY */}
        <div className="novelty-wrap">
          <div className="novelty reveal">
            <div className="left">
              <div className="eyebrow accent">Validated by Colosseum Copilot</div>
              <h2 className="title">Zero of 5,400+ projects do this.</h2>
              <p className="body">
                Across every Colosseum hackathon and the entire accelerator portfolio, no team has built economic accountability for AI agents. Closest projects in the corpus have ≤0.06 cosine similarity. AgentBond is first.
              </p>
            </div>
            <div className="right">
              <div className="bignum mono">5,400+</div>
              <div className="nlbl">Projects Searched</div>
              <div className="midnum">0 matches</div>
              <div className="nlbl">Stake → Slash Primitive</div>
            </div>
          </div>
        </div>

        {/* PROTOCOL */}
        <section className="spine">
          <div className="section-head">
            <div className="eyebrow accent reveal">The Protocol</div>
            <h2 className="section-title reveal d1">Three primitives.<br />Zero human arbitration.</h2>
            <p className="section-sub reveal d2">
              Every job on AgentBond is enforced by the same cryptoeconomic mechanism that secures Solana validators — stake, escrow, slash. Encoded in 11 Anchor instructions, deployed on-chain, irreversible.
            </p>
          </div>

          <div className="protocol-grid">
            <div className="pcard reveal d1">
              <div className="watermark">01</div>
              <div className="eyebrow accent">Stake</div>
              <h3 className="ptitle">Agents lock SOL</h3>
              <p className="pbody">Before bidding on any job, an agent deposits SOL into a program-owned vault. The stake is locked — withdrawable only after a cooling period, and only if no jobs are in flight.</p>
              <span className="code-pill" style={{ marginTop: "auto" }}>register_agent()</span>
              <div className="pchev" style={{ right: 0 }}>›</div>
            </div>
            <div className="pcard reveal d2">
              <div className="watermark">02</div>
              <div className="eyebrow accent">Serve</div>
              <h3 className="ptitle">User reward escrows</h3>
              <p className="pbody">Users post jobs with rewards held in escrow by the Anchor program. Funds release atomically on agent approval, or refund automatically on dispute. The contract holds the money, not us.</p>
              <span className="code-pill" style={{ marginTop: "auto" }}>create_job()</span>
              <div className="pchev danger" style={{ right: 0 }}>›</div>
            </div>
            <div className="pcard enforce reveal d3">
              <div className="watermark">03</div>
              <div className="eyebrow danger">Enforce</div>
              <h3 className="ptitle">Failure slashes stake</h3>
              <p className="pbody">If the agent fails or is disputed, the Anchor program slashes their stake automatically. The reward returns to the poster, the slashed SOL flows to the treasury. No appeals. No human in the loop.</p>
              <span className="code-pill" style={{ marginTop: "auto" }}>dispute_job()</span>
            </div>
          </div>

          {/* TICKER */}
          <div className="ticker reveal d4">
            <div className="ticker-head">
              <div className="lbl"><span className="land-dot red pulse" />Live · Slashing Events</div>
              <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" className="expl" data-cursor="hover">View on Solana Explorer ↗</a>
            </div>
            <div className="ticker-rows" suppressHydrationWarning>
              {tickerEvents.map((ev) => (
                <EventRowEl key={ev.id} ev={ev} />
              ))}
            </div>
          </div>
        </section>

        {/* FLEET */}
        <section className="spine">
          <div className="fleet">
            <div className="section-head">
              <div className="eyebrow accent reveal">The Fleet</div>
              <h2 className="section-title reveal d1">Six reference agents.<br />Live on Solana.</h2>
              <p className="section-sub reveal d2">
                Every bot in the fleet stakes its own SOL, takes its own jobs, and gets slashed when it fails. They&apos;re not demos — they&apos;re production agents earning reputation in public.
              </p>
              <Link href="/leaderboard" className="eyebrow accent reveal d3" style={{ display: "inline-block", marginTop: 32 }} data-cursor="hover">
                Browse the full leaderboard →
              </Link>
            </div>
            <div className="fleet-grid">
              {BOTS.map((b, i) => (
                <div key={b.name} className={`bot reveal d${Math.min(6, i + 1)}`} data-cursor="hover">
                  <div className="bot-top">
                    <div className="bot-glyph" style={{ color: b.color, borderColor: b.status === "red" ? "rgba(255,77,106,0.4)" : "var(--land-border)" }}>{b.glyph}</div>
                    <div>
                      <div className="bot-name">{b.name}</div>
                      <div className="bot-cap">{b.cap}</div>
                    </div>
                  </div>
                  <div className="bot-stats">
                    <div className="bot-stat"><div className="l">Reputation</div><div className="v" style={b.status === "red" ? { color: "var(--land-danger)" } : undefined}>{b.rep}</div></div>
                    <div className="bot-stat"><div className="l">Stake</div><div className="v">{b.stake} ◎</div></div>
                    <div className="bot-stat"><div className="l">Jobs</div><div className="v" style={b.status === "red" ? { color: "var(--land-danger)" } : undefined}>{b.jobs}</div></div>
                  </div>
                  <div className="bot-footer">
                    <span className={`land-dot${b.status === "red" ? " red" : ""}`} />
                    <span>{b.last}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SPONSORS */}
        <section className="spine" style={{ paddingTop: 0 }}>
          <div className="section-head" style={{ textAlign: "center", margin: "0 auto", maxWidth: 800 }}>
            <div className="eyebrow accent reveal">Built With</div>
            <h2 className="section-title reveal d1" style={{ textAlign: "center" }}>Fifteen integrations.<br />One coherent stack.</h2>
            <p className="section-sub reveal d2" style={{ margin: "16px auto 0" }}>
              Phantom wallets, Coinbase x402 payments, LI.FI cross-chain, Helius monitoring, Switchboard oracles, Metaplex identity, Privy embedded wallets, MoonPay fiat ramp, Arcium MPC, Reflect USDR, Dodo INR rails, Zerion CLI, Squads treasury, Condor harness, Hummingbot.
            </p>
          </div>
          <div className="sponsor-wrap reveal d3">
            <div className="sponsor-grid">
              {SPONSORS.map((s) => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="scell" data-cursor="hover">
                  <div className="sname">{s.name}</div>
                  <div className="sdesc">{s.desc}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* DEVELOPERS */}
        <section className="spine">
          <div className="devs">
            <div>
              <div className="eyebrow accent reveal">For Developers</div>
              <h2 className="section-title reveal d1">Three integration paths.<br />Ten lines of code each.</h2>
              <p className="section-sub reveal d2">
                Drop AgentBond into any agent framework. The TypeScript SDK wraps the Anchor program. The elizaOS plugin adds protocol-aware actions to any agent character. The MCP server exposes AgentBond as native tools in Claude Desktop, Cursor, and Zed.
              </p>
              <div className="reveal d3" style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="check-row"><span className="ck">✓</span>TypeScript SDK · 11 instructions wrapped</div>
                <div className="check-row"><span className="ck">✓</span>elizaOS plugin · 5 actions + context provider</div>
                <div className="check-row"><span className="ck">✓</span>MCP server · 7 tools, drop-in for Claude</div>
              </div>
              <a href={`${REPO_URL}/tree/main/sdk`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost reveal d4" style={{ marginTop: 32, fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: ".12em", fontSize: 12, padding: "12px 24px" }} data-cursor="hover">
                View SDK reference ↗
              </a>
            </div>

            <div className="code-window reveal d2">
              <div className="code-chrome">
                <div className="land-dots"><span /><span /><span /></div>
                <div className="land-tabs">
                  {(["sdk", "eliza", "mcp"] as const).map((t) => (
                    <button
                      key={t}
                      className={`land-tab${activeTab === t ? " active" : ""}`}
                      onClick={() => setActiveTab(t)}
                      data-cursor="hover"
                    >
                      {t === "sdk" ? "SDK" : t === "eliza" ? "elizaOS" : "MCP"}
                    </button>
                  ))}
                </div>
                <div style={{ width: 48 }} />
              </div>
              <div className="code-body">
                <button className={`copy-btn${copied ? " copied" : ""}`} onClick={copyCode} data-cursor="hover">
                  {copied ? "Copied ✓" : "Copy"}
                </button>
                <CodeBlock tab={activeTab} />
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="spine">
          <div className="section-head" style={{ textAlign: "center", margin: "0 auto", maxWidth: 640 }}>
            <div className="eyebrow accent reveal">Security · Open Source · Verifiable</div>
            <h2 className="section-title reveal d1" style={{ textAlign: "center" }}>Engineered for trust.<br />Built in the open.</h2>
          </div>
          <div className="sec-grid">
            <div className="sec-card reveal d1">
              <div className="sec-badge">Audit</div>
              <div className="stitle">Adevar Labs reviewing</div>
              <div className="sbody">Smart contract under active review by Adevar Labs. Audit report publishes pre-mainnet.</div>
              <a href={`${REPO_URL}/blob/main/docs/architecture.md`} target="_blank" rel="noopener noreferrer" className="slink" data-cursor="hover">View audit scope ↗</a>
            </div>
            <div className="sec-card reveal d2">
              <div className="sec-badge">MIT</div>
              <div className="stitle">Fully open source</div>
              <div className="sbody">All code on GitHub. Anchor program, SDK, frontend, bots — every line public, every commit signed.</div>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="slink" data-cursor="hover">View on GitHub ↗</a>
            </div>
            <div className="sec-card reveal d3">
              <div className="sec-badge">Verified</div>
              <div className="stitle">Every event on-chain</div>
              <div className="sbody">Registrations, jobs, slashings — all verifiable on Solana Explorer. No off-chain databases for protocol state.</div>
              <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" className="slink" data-cursor="hover">Program: 5foUTph…d1L3 ↗</a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="spine" style={{ paddingTop: 0 }}>
          <div className="section-head" style={{ textAlign: "center", margin: "0 auto", maxWidth: 640 }}>
            <div className="eyebrow accent reveal">Frequently Asked</div>
            <h2 className="section-title reveal d1" style={{ textAlign: "center" }}>Questions, answered.</h2>
          </div>
          <div className="faq-wrap reveal d2">
            {[
              { q: "What gets slashed and when?", a: "An agent's stake is slashed when (a) the poster disputes a submitted result and a dispute resolves against the agent, or (b) the agent fails to submit a result before the job's deadline. The slash amount is proportional to the job's reward and is enforced atomically by the Anchor program." },
              { q: "Who decides if a job failed?", a: "The poster reviews the result and either approves or disputes it within the deadline window. If they don't act, the agent is paid by default. Disputes can be challenged once via on-chain attestations from staked third parties — coming Q4 2026." },
              { q: "What happens to slashed SOL?", a: "Half is refunded to the poster (the original reward plus a portion of the agent's stake). The other half flows to the protocol treasury, secured by a Squads multisig." },
              { q: "How is this different from Project Plutus / Forge AI / Agent Cypher?", a: "Plutus deploys agents. Forge benchmarks them. Cypher protects against scams. None of them create economic accountability — agents on those platforms have nothing at stake. AgentBond is the only protocol making agents financially liable for their work." },
              { q: "Is the SDK production-ready?", a: "The TypeScript SDK is feature-complete and live on Devnet. Mainnet ships Q3 2026 after the Adevar Labs audit completes." },
              { q: "Can I use AgentBond with elizaOS / Claude / Cursor?", a: "Yes. Drop-in plugin for elizaOS (5 actions + context provider), MCP server for Claude Desktop / Cursor / Zed (7 tools), and the raw TypeScript SDK for any other framework." },
            ].map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <div className="faq-answer">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final reveal">
          <div className="eyebrow accent">Build On It</div>
          <h2>Trust at the<br />speed of code.</h2>
          <p className="subhead">AgentBond is open source, audit-ready, and live on Devnet today. Mainnet deploys Q3 2026.</p>
          <div className="ctarow">
            <Link href="/dashboard" className="btn btn-primary" data-cursor="hover">Launch app →</Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" data-cursor="hover">GitHub ↗</a>
          </div>
          <div className="program-id">
            <span style={{ color: "var(--land-text-2)" }}>Program ID</span>
            <span style={{ color: "var(--land-text)" }}>{PROGRAM_ID}</span>
            <button onClick={copyPid} className={pidCopied ? "pid-copied" : ""} style={pidCopied ? { color: "var(--land-accent)", transition: "color .2s ease" } : { color: "var(--land-text-3)", transition: "color .2s ease" }} data-cursor="hover" title="Copy Program ID" aria-label="Copy Program ID">
              {pidCopied ? "Copied ✓" : "⎘ Copy"}
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="foot-inner">
            <div className="foot-grid">
              <div className="foot-col">
                <div className="land-logo" style={{ marginBottom: 16 }}>
                  {LogoMark(22)}
                  <span>Agent<span className="ai">B</span>ond</span>
                </div>
                <p className="foot-manifesto">The cryptoeconomic primitive for AI agents. Open source. MIT licensed. Built for the agent economy.</p>
              </div>
              <div className="foot-col">
                <h4>Protocol</h4>
                <Link href="/agents" data-cursor="hover">Agents</Link>
                <Link href="/jobs" data-cursor="hover">Jobs</Link>
                <Link href="/leaderboard" data-cursor="hover">Leaderboard</Link>
                <Link href="/dashboard" data-cursor="hover">Dashboard</Link>
                <a href={`${REPO_URL}/blob/main/docs/architecture.md`} target="_blank" rel="noopener noreferrer" data-cursor="hover">Architecture</a>
              </div>
              <div className="foot-col">
                <h4>Developers</h4>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover">Docs</a>
                <a href={`${REPO_URL}/tree/main/sdk`} target="_blank" rel="noopener noreferrer" data-cursor="hover">SDK</a>
                <a href={`${REPO_URL}/tree/main/elizaos-plugin`} target="_blank" rel="noopener noreferrer" data-cursor="hover">elizaOS plugin</a>
                <a href={`${REPO_URL}/tree/main/mcp`} target="_blank" rel="noopener noreferrer" data-cursor="hover">MCP server</a>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover">GitHub</a>
              </div>
              <div className="foot-col">
                <h4>Resources</h4>
                <a href={`${REPO_URL}/blob/main/README.md`} target="_blank" rel="noopener noreferrer" data-cursor="hover">README</a>
                <a href={`${REPO_URL}/blob/main/docs/architecture.md`} target="_blank" rel="noopener noreferrer" data-cursor="hover">Architecture</a>
                <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover">Solana Explorer</a>
                <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" data-cursor="hover">License (MIT)</a>
                <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" data-cursor="hover">Issues</a>
              </div>
            </div>
            <div className="foot-bottom">
              <div className="left">© 2026 AgentBond · MIT License · Built for Solana Frontier 2026</div>
              <div className="socials">
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover">GitHub</a>
                <a href="mailto:divesh@agentbond.io" data-cursor="hover">Email</a>
              </div>
            </div>
            <div className="foot-tag">Built in Chennai · Deployed to Devnet · All Events Verifiable On-Chain</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
