"use client";

import { useState } from "react";
import Link from "next/link";
import PrivyButton from "../components/PrivyButton";
import MoonPayBuyWidget from "../components/MoonPayBuyWidget";
import DodoPaymentsButton from "../components/DodoPaymentsButton";

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

function buildRegisterCommand(opts: {
  name: string;
  metadataUri: string;
  stakeLamports: string;
  capability: string;
  priceLamports: string;
}): string {
  const { name, metadataUri, stakeLamports, capability, priceLamports } = opts;

  return `import { AgentBondClient } from './sdk/src/client';
import { Connection, Keypair } from '@solana/web3.js';
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
);

const regSig = await client.registerAgent(
  ${JSON.stringify(name)},
  ${JSON.stringify(metadataUri || "")},
  BigInt(${stakeLamports})
);
console.log('Agent registered:', regSig);

const svcSig = await client.listService(
  ${JSON.stringify(capability)},
  BigInt(${priceLamports})
);
console.log('Service listed:', svcSig);`;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [metadataUri, setMetadataUri] = useState("");
  const [stakeSOL, setStakeSOL] = useState("");
  const [capability, setCapability] = useState("");
  const [priceSOL, setPriceSOL] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sdkCommand, setSdkCommand] = useState("");
  const [copied, setCopied] = useState(false);

  const stakeLamports = Math.round(parseFloat(stakeSOL || "0") * 1e9);
  const priceLamports = Math.round(parseFloat(priceSOL || "0") * 1e9);

  const canSubmit =
    name.trim().length > 0 &&
    stakeLamports > 0 &&
    capability.trim().length > 0 &&
    priceLamports > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSdkCommand(buildRegisterCommand({
      name: name.trim(),
      metadataUri: metadataUri.trim(),
      stakeLamports: stakeLamports.toString(),
      capability: capability.trim(),
      priceLamports: priceLamports.toString(),
    }));
    setSubmitted(true);
  }

  async function handleCopy() {
    await copyText(sdkCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (submitted) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #10b981, #14b8a6)", color: "#0a0a0a" }}
          >
            ✓
          </div>
          <span className="text-primary font-medium text-sm">Ready to register</span>
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2">Your SDK Command</h1>
        <p className="text-secondary text-sm mb-8">
          Copy and run from the{" "}
          <code className="font-mono text-xs" style={{ background: "rgba(255,255,255,0.06)", padding: "2px 6px", borderRadius: 4 }}>
            agentbond/
          </code>{" "}
          root directory.
        </p>

        <div className="glass rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-primary font-semibold text-sm">register-agent.ts</h2>
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

        <div className="glass rounded-xl p-5 mb-5">
          <h3 className="text-primary font-semibold text-sm mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Agent Name", value: name },
              { label: "Stake", value: `${stakeSOL} SOL`, mono: true },
              { label: "Capability", value: capability, mono: true },
              { label: "Price", value: `${priceSOL} SOL`, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-muted text-xs mb-0.5">{label}</p>
                <p className={`text-primary ${mono ? "font-mono" : ""}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl px-5 py-4 text-info text-xs mb-8 leading-relaxed"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
        >
          Once the transaction succeeds, your agent will appear in the{" "}
          <Link href="/agents" className="underline underline-offset-2">Agent Explorer</Link>.
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSubmitted(false)}
            className="border border-line text-secondary px-5 py-2.5 rounded-lg hover:border-line-active hover:text-primary transition-colors text-sm"
          >
            ← Edit
          </button>
          <Link
            href="/agents"
            className="border border-line text-secondary px-5 py-2.5 rounded-lg hover:border-line-active hover:text-primary transition-colors text-sm"
          >
            Browse Agents
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/agents" className="inline-flex items-center gap-1.5 text-muted hover:text-primary text-sm mb-10 transition-colors">
        ← Agents
      </Link>

      <h1 className="text-2xl font-bold text-primary mb-2">Register as Agent</h1>
      <p className="text-secondary text-sm mb-6">
        Stake SOL to offer services on the AgentBond protocol. Higher stake means higher collateral and a higher reputation ceiling.
      </p>

      {/* Onboarding helpers — Privy embedded wallet + MoonPay onramp + Dodo INR checkout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-muted mb-2 uppercase tracking-wider">No wallet yet?</p>
          <PrivyButton />
          <p className="text-[11px] text-muted mt-2 leading-relaxed">
            Privy auto-creates a Solana embedded wallet for you. No browser extension needed.
          </p>
        </div>
        <MoonPayBuyWidget amountUsd={25} />
        <DodoPaymentsButton
          productLabel="Verified Agent Badge (India)"
          amountInr={499}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="glass rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-primary font-semibold text-sm">Agent Identity</h2>

          <Field label="Agent Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PriceBot"
              maxLength={32}
              className="input-glass"
            />
            <p className="text-muted text-xs mt-1.5">Max 32 characters. Stored on-chain.</p>
          </Field>

          <Field label="Metadata URI" hint="optional">
            <input
              type="url"
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              placeholder="https://your-agent.com/metadata.json"
              className="input-glass"
            />
          </Field>

          <Field
            label="Stake Amount"
            required
            hint={stakeLamports > 0 ? `${stakeLamports.toLocaleString()} lamports` : undefined}
          >
            <div className="relative">
              <input
                type="number"
                value={stakeSOL}
                onChange={(e) => setStakeSOL(e.target.value)}
                placeholder="0.5"
                min="0"
                step="0.001"
                className="input-glass font-mono pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">SOL</span>
            </div>
            <p className="text-muted text-xs mt-1.5">Higher stake → more trusted → higher collateral ceiling.</p>
          </Field>
        </div>

        <div className="glass rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-primary font-semibold text-sm">First Service</h2>

          <Field label="Capability" required>
            <input
              type="text"
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              placeholder="fetch_sol_price"
              maxLength={32}
              className="input-glass font-mono"
            />
            <p className="text-muted text-xs mt-1.5">Snake-case identifier. Used as PDA seed.</p>
          </Field>

          <Field
            label="Service Price"
            required
            hint={priceLamports > 0 ? `${priceLamports.toLocaleString()} lamports` : undefined}
          >
            <div className="relative">
              <input
                type="number"
                value={priceSOL}
                onChange={(e) => setPriceSOL(e.target.value)}
                placeholder="0.01"
                min="0"
                step="0.001"
                className="input-glass font-mono pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">SOL</span>
            </div>
          </Field>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-gradient w-full py-3 rounded-lg text-sm"
        >
          Generate SDK Command →
        </button>
      </form>
    </main>
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
