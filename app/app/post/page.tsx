"use client";

import { useState } from "react";
import Link from "next/link";

const DEADLINE_OPTIONS = [
  { label: "1 hour", seconds: 3_600 },
  { label: "6 hours", seconds: 21_600 },
  { label: "24 hours", seconds: 86_400 },
  { label: "7 days", seconds: 604_800 },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function sha256Hex(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
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
// Store description off-chain so anyone can look it up by hash
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

  return `// Run from the agentbond/ root directory:\n// npx ts-node --esm post-job.ts\n\n${setup}\n${metaStep}\n\n${txStep}\nconsole.log('✓ Transaction:', sig);`;
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

  const rewardLamports = Math.round(parseFloat(rewardSOL || "0") * 1e9);
  const deadlineLabel =
    DEADLINE_OPTIONS.find((o) => o.seconds === deadlineSecs)?.label ?? "";

  const canPreview =
    description.trim().length > 0 &&
    rewardLamports > 0 &&
    (mode === 0 || agentPubkey.trim().length > 0);

  async function handlePreview() {
    if (!canPreview) return;
    setPreviewing(true);
    try {
      const h = await sha256Hex(description);
      const cmd = buildPostJobCommand({
        description,
        hash: h,
        lamports: rewardLamports.toString(),
        deadlineSecs,
        mode,
        agentPubkey: agentPubkey.trim(),
      });
      setHash(h);
      setSdkCommand(cmd);
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

        <div className="bg-surface border border-line rounded-xl p-6 mb-6 flex flex-col gap-4">
          <ReviewRow label="Description">
            <span className="text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {description}
            </span>
          </ReviewRow>
          <ReviewRow label="SHA-256 Hash">
            <span className="font-mono text-xs text-secondary break-all">{hash}</span>
          </ReviewRow>
          <ReviewRow label="Reward">
            <span className="font-mono text-primary">{rewardSOL} SOL</span>
          </ReviewRow>
          <ReviewRow label="Deadline">
            <span className="text-primary">{deadlineLabel}</span>
          </ReviewRow>
          <ReviewRow label="Mode">
            <span className="text-primary">
              {mode === 1 ? "⚡ Instant Hire" : "📋 Job Board"}
            </span>
          </ReviewRow>
          {mode === 1 && (
            <ReviewRow label="Agent">
              <span className="font-mono text-xs text-secondary break-all">
                {agentPubkey}
              </span>
            </ReviewRow>
          )}
        </div>

        <div className="bg-surface border border-line rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-primary font-semibold text-sm">SDK Command</h2>
            <button
              onClick={handleCopy}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                copied
                  ? "border-emerald/30 bg-emerald/10 text-emerald"
                  : "border-line text-secondary hover:border-line-active hover:text-primary"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy Command"}
            </button>
          </div>
          <pre className="bg-elevated rounded-lg p-4 text-xs font-mono text-secondary overflow-x-auto leading-relaxed whitespace-pre">
            {sdkCommand}
          </pre>
        </div>

        <div className="bg-info/5 border border-info/20 rounded-xl px-5 py-4 text-info text-xs mb-8 leading-relaxed">
          <span className="font-semibold">Wallet integration coming soon.</span>{" "}
          Until then, copy the command above and run it from the{" "}
          <code className="font-mono">agentbond/</code> root directory using
          your local Solana keypair.
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

      <div className="flex flex-col gap-6">
        <Field label="Description" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task you want the agent to perform…"
            rows={5}
            className="w-full bg-elevated border border-line rounded-lg px-4 py-3 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors resize-none"
          />
        </Field>

        <Field label="Reward" required hint={rewardLamports > 0 ? `${rewardLamports.toLocaleString()} lamports` : undefined}>
          <div className="relative">
            <input
              type="number"
              value={rewardSOL}
              onChange={(e) => setRewardSOL(e.target.value)}
              placeholder="0.5"
              min="0"
              step="0.001"
              className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 pr-14 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors font-mono"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">
              SOL
            </span>
          </div>
        </Field>

        <Field label="Deadline">
          <div className="grid grid-cols-4 gap-2">
            {DEADLINE_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                type="button"
                onClick={() => setDeadlineSecs(opt.seconds)}
                className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  deadlineSecs === opt.seconds
                    ? "border-emerald bg-emerald/10 text-emerald"
                    : "border-line text-secondary hover:border-line-active hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Mode">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode(0)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                mode === 0
                  ? "border-info bg-info/10 text-info"
                  : "border-line text-secondary hover:border-line-active hover:text-primary"
              }`}
            >
              📋 Job Board
            </button>
            <button
              type="button"
              onClick={() => setMode(1)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                mode === 1
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-secondary hover:border-line-active hover:text-primary"
              }`}
            >
              ⚡ Instant Hire
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
              className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors font-mono"
            />
            <Link
              href="/agents"
              className="inline-block mt-2 text-xs text-info hover:opacity-80 transition-opacity"
            >
              Browse agents →
            </Link>
          </Field>
        )}

        <button
          onClick={handlePreview}
          disabled={!canPreview || previewing}
          className="w-full bg-emerald text-bg font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              n === current
                ? "bg-emerald text-bg"
                : n < current
                  ? "bg-emerald/30 text-emerald"
                  : "bg-elevated text-muted border border-line"
            }`}
          >
            {n < current ? "✓" : n}
          </div>
          <span
            className={`text-sm ${
              n === current ? "text-primary font-medium" : "text-muted"
            }`}
          >
            {n === 1 ? "Job Details" : "Review & Submit"}
          </span>
          {n < 2 && <div className="w-8 h-px bg-line" />}
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

function ReviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-4 last:border-0 last:pb-0">
      <span className="text-muted text-xs">{label}</span>
      <div>{children}</div>
    </div>
  );
}
