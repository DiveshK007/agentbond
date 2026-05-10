"use client";

import { useState } from "react";
import Link from "next/link";
import { ArciumExplainer, ArciumBadge } from "../components/ArciumBadge";
import { ReflectExplainer, ReflectBadge } from "../components/ReflectBadge";

const DEADLINE_OPTIONS = [
  { label: "1 hour", seconds: 3_600 },
  { label: "6 hours", seconds: 21_600 },
  { label: "24 hours", seconds: 86_400 },
  { label: "7 days", seconds: 604_800 },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", encoded as unknown as ArrayBuffer);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

function buildPostJobCommand(opts: {
  description: string;
  hash: string;
  lamports: string;
  deadlineSecs: number;
  mode: 0 | 1;
  agentPubkey: string;
}): string {
  const { description, hash, lamports, deadlineSecs, mode, agentPubkey } = opts;
  const setup = `import { AgentBondClient } from './sdk/src/client';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { readFileSync } from 'fs';

const keypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(
    readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')
  ))
);
const client = new AgentBondClient(
  new Connection('https://api.devnet.solana.com', 'confirmed'),
  new Wallet(keypair)
);`;

  const metaStep = `
await fetch('${API_BASE}/api/metadata/job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ description: ${JSON.stringify(description)} }),
});`;

  const txStep =
    mode === 1
      ? `const sig = await client.instantHire(
  new PublicKey('${agentPubkey}'),
  Buffer.from('${hash}', 'hex'),
  BigInt(${lamports}),
  BigInt(${deadlineSecs})
);`
      : `const sig = await client.postJob(
  Buffer.from('${hash}', 'hex'),
  BigInt(${lamports}),
  BigInt(${deadlineSecs})
);`;

  return `${setup}\n${metaStep}\n\n${txStep}\nconsole.log('Transaction:', sig);`;
}

export default function PostJobPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [description, setDescription] = useState("");
  const [rewardSOL, setRewardSOL] = useState("");
  const [deadlineSecs, setDeadlineSecs] = useState(86_400);
  const [mode, setMode] = useState<0 | 1>(0);
  const [agentPubkey, setAgentPubkey] = useState("");
  const [hash, setHash] = useState("");
  const [sdkCommand, setSdkCommand] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confidential, setConfidential] = useState(false);
  const [rewardCurrency, setRewardCurrency] = useState<"SOL" | "USDR">("SOL");

  const rewardLamports = Math.round(parseFloat(rewardSOL || "0") * 1e9);
  const deadlineLabel = DEADLINE_OPTIONS.find((o) => o.seconds === deadlineSecs)?.label ?? "";
  const canPreview =
    description.trim().length > 0 &&
    rewardLamports > 0 &&
    (mode === 0 || agentPubkey.trim().length > 0);

  async function handlePreview() {
    if (!canPreview) return;
    setPreviewing(true);
    try {
      const h = await sha256Hex(description);
      setSdkCommand(buildPostJobCommand({
        description,
        hash: h,
        lamports: rewardLamports.toString(),
        deadlineSecs,
        mode,
        agentPubkey: agentPubkey.trim(),
      }));
      setHash(h);
      setStep(2);
    } finally {
      setPreviewing(false);
    }
  }

  async function handleCopy() {
    await copyText(sdkCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === 2) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <StepIndicator current={2} />
        <h1 className="text-2xl font-bold text-primary mb-8">Review & Submit</h1>

        {(confidential || rewardCurrency === "USDR") && (
          <div className="flex items-center gap-2 mb-3">
            {confidential && <ArciumBadge size="sm" />}
            {rewardCurrency === "USDR" && <ReflectBadge size="sm" />}
          </div>
        )}

        <div className="glass rounded-xl p-6 mb-5 flex flex-col gap-4">
          {[
            { label: "Description", value: description, multiline: true },
            { label: "SHA-256 Hash", value: hash, mono: true, small: true },
            { label: "Reward", value: `${rewardSOL} ${rewardCurrency === "USDR" ? "USDR" : "SOL"}`, mono: true },
            { label: "Deadline", value: deadlineLabel },
            { label: "Mode", value: mode === 1 ? "Instant Hire" : "Job Board" },
            { label: "Privacy", value: confidential ? "Arcium-encrypted" : "Public" },
            ...(mode === 1 ? [{ label: "Agent", value: agentPubkey, mono: true, small: true }] : []),
          ].map(({ label, value, mono, small, multiline }) => (
            <div key={label} className="flex flex-col gap-1 border-b border-line pb-4 last:border-0 last:pb-0">
              <span className="text-muted text-xs">{label}</span>
              <span
                className={`text-sm ${mono ? "font-mono" : ""} ${small ? "text-xs" : ""} text-secondary`}
                style={multiline ? { whiteSpace: "pre-wrap" } : { wordBreak: "break-all" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="glass rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-primary font-semibold text-sm">SDK Command</h2>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
              style={
                copied
                  ? { background: "rgba(16,185,129,0.1)", color: "#10b981", borderColor: "rgba(16,185,129,0.3)" }
                  : { borderColor: "var(--border)", color: "var(--text-secondary)" }
              }
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          <pre
            className="text-xs font-mono text-secondary overflow-x-auto leading-relaxed whitespace-pre rounded-lg p-4"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            {sdkCommand}
          </pre>
        </div>

        <div
          className="rounded-xl px-5 py-4 text-info text-xs mb-8 leading-relaxed"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
        >
          Copy the command above and run it from the <code className="font-mono">agentbond/</code> root directory.
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            className="border border-line text-secondary px-5 py-2.5 rounded-lg hover:border-line-active hover:text-primary transition-colors text-sm"
          >
            ← Edit
          </button>
          <Link
            href="/jobs"
            className="border border-line text-secondary px-5 py-2.5 rounded-lg hover:border-line-active hover:text-primary transition-colors text-sm"
          >
            View Job Board
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <StepIndicator current={1} />
      <h1 className="text-2xl font-bold text-primary mb-8">Job Details</h1>

      <div className="flex flex-col gap-5">
        <Field label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task you want the agent to perform…"
            rows={5}
            className="input-glass resize-none"
            style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}
          />
        </Field>

        <Field
          label="Reward"
          required
          hint={rewardLamports > 0 ? `${rewardLamports.toLocaleString()} lamports` : undefined}
        >
          <div className="relative">
            <input
              type="number"
              value={rewardSOL}
              onChange={(e) => setRewardSOL(e.target.value)}
              placeholder="0.5"
              min="0"
              step="0.001"
              className="input-glass font-mono pr-14"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">SOL</span>
          </div>
        </Field>

        <Field label="Deadline">
          <div className="grid grid-cols-4 gap-2">
            {DEADLINE_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                type="button"
                onClick={() => setDeadlineSecs(opt.seconds)}
                className="py-2.5 rounded-lg border text-sm font-medium transition-all"
                style={
                  deadlineSecs === opt.seconds
                    ? { background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#10b981" }
                    : { borderColor: "var(--border)", color: "var(--text-secondary)" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Mode">
          <div
            className="flex gap-0 p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              onClick={() => setMode(0)}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
              style={
                mode === 0
                  ? { background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.15))", color: "#10b981", borderColor: "rgba(16,185,129,0.2)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              Job Board
            </button>
            <button
              type="button"
              onClick={() => setMode(1)}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
              style={
                mode === 1
                  ? { background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }
                  : { color: "var(--text-secondary)" }
              }
            >
              Instant Hire
            </button>
          </div>
        </Field>

        {mode === 1 && (
          <Field label="Agent Pubkey" required>
            <input
              type="text"
              value={agentPubkey}
              onChange={(e) => setAgentPubkey(e.target.value)}
              placeholder="Base58 pubkey of the agent to hire…"
              spellCheck={false}
              className="input-glass font-mono"
            />
            <Link href="/agents" className="inline-block mt-2 text-xs text-info hover:opacity-80 transition-opacity">
              Browse agents →
            </Link>
          </Field>
        )}

        {/* Reward currency — SOL or USDR (Reflect stablecoin) */}
        <Field label="Reward Currency">
          <div
            className="flex gap-0 p-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <button
              type="button"
              onClick={() => setRewardCurrency("SOL")}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
              style={
                rewardCurrency === "SOL"
                  ? { background: "rgba(16,185,129,0.15)", color: "#10b981" }
                  : { color: "var(--text-secondary)" }
              }
            >
              ◎ SOL
            </button>
            <button
              type="button"
              onClick={() => setRewardCurrency("USDR")}
              className="flex-1 py-2 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2"
              style={
                rewardCurrency === "USDR"
                  ? { background: "rgba(0,200,255,0.15)", color: "#67e8f9" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <ReflectBadge size="xs" /> Stablecoin
            </button>
          </div>
          {rewardCurrency === "USDR" && (
            <div className="mt-3">
              <ReflectExplainer />
            </div>
          )}
        </Field>

        {/* Confidential mode — Arcium MPC */}
        <Field label="Privacy">
          <button
            type="button"
            onClick={() => setConfidential(!confidential)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all"
            style={{
              background: confidential
                ? "rgba(139,92,246,0.08)"
                : "rgba(255,255,255,0.02)",
              borderColor: confidential
                ? "rgba(139,92,246,0.3)"
                : "var(--border)",
            }}
          >
            <span className="inline-flex items-center gap-2 text-sm">
              <ArciumBadge size="sm" />
              <span className={confidential ? "text-primary" : "text-secondary"}>
                Confidential mode
              </span>
            </span>
            <span
              className="w-9 h-5 rounded-full relative transition-colors"
              style={{
                background: confidential ? "#a78bfa" : "rgba(255,255,255,0.1)",
              }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                style={{
                  transform: confidential ? "translateX(18px)" : "translateX(2px)",
                }}
              />
            </span>
          </button>
          {confidential && (
            <div className="mt-3">
              <ArciumExplainer />
            </div>
          )}
        </Field>

        <button
          onClick={handlePreview}
          disabled={!canPreview || previewing}
          className="btn-gradient w-full py-3 rounded-lg text-sm"
        >
          {previewing ? "Computing hash…" : "Preview →"}
        </button>
      </div>
    </main>
  );
}

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={
              n === current
                ? { background: "linear-gradient(135deg, #10b981, #14b8a6)", color: "#0a0a0a" }
                : n < current
                  ? { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }
                  : { background: "rgba(255,255,255,0.04)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {n < current ? "✓" : n}
          </div>
          <span
            className="text-sm"
            style={{ color: n === current ? "var(--text-primary)" : "var(--text-muted)", fontWeight: n === current ? 500 : undefined }}
          >
            {n === 1 ? "Job Details" : "Review & Submit"}
          </span>
          {n < 2 && <div className="w-8 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-secondary text-sm font-medium">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
        {hint && <span className="text-muted text-xs font-mono">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
