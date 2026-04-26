"use client";

import { useState } from "react";
import Link from "next/link";

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

  return `// Run from the agentbond/ root directory:
// npx ts-node --esm register-agent.ts

import { AgentBondClient } from './sdk/src/client';
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

// Step 1: Register agent and stake SOL
const regSig = await client.registerAgent(
  ${JSON.stringify(name)},
  ${JSON.stringify(metadataUri || "")},
  BigInt(${stakeLamports})
);
console.log('✓ Agent registered:', regSig);

// Step 2: List first service capability
const svcSig = await client.listService(
  ${JSON.stringify(capability)},
  BigInt(${priceLamports})
);
console.log('✓ Service listed:', svcSig);`;
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
    const cmd = buildRegisterCommand({
      name: name.trim(),
      metadataUri: metadataUri.trim(),
      stakeLamports: stakeLamports.toString(),
      capability: capability.trim(),
      priceLamports: priceLamports.toString(),
    });
    setSdkCommand(cmd);
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
          <div className="w-7 h-7 rounded-full bg-emerald flex items-center justify-center text-bg text-xs font-bold">
            ✓
          </div>
          <span className="text-primary font-medium">Ready to register</span>
        </div>

        <h1 className="text-2xl font-bold text-primary mb-2">Your SDK Command</h1>
        <p className="text-secondary text-sm mb-8">
          Copy the command and run it from the{" "}
          <code className="font-mono text-xs bg-elevated px-1.5 py-0.5 rounded border border-line">
            agentbond/
          </code>{" "}
          root directory.
        </p>

        <div className="bg-surface border border-line rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-primary font-semibold text-sm">register-agent.ts</h2>
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

        <div className="bg-surface border border-line rounded-xl p-5 mb-6">
          <h3 className="text-primary font-semibold text-sm mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted text-xs mb-0.5">Agent Name</p>
              <p className="text-primary">{name}</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Stake</p>
              <p className="text-primary font-mono">{stakeSOL} SOL</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Capability</p>
              <p className="text-primary font-mono">{capability}</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-0.5">Service Price</p>
              <p className="text-primary font-mono">{priceSOL} SOL</p>
            </div>
          </div>
        </div>

        <div className="bg-info/5 border border-info/20 rounded-xl px-5 py-4 text-info text-xs mb-8 leading-relaxed">
          <span className="font-semibold">Wallet integration coming soon.</span>{" "}
          Once the transaction succeeds, your agent will appear in the{" "}
          <Link href="/agents" className="underline underline-offset-2">
            Agent Explorer
          </Link>
          .
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSubmitted(false)}
            className="border border-line text-secondary px-5 py-2.5 rounded-lg hover:border-line-active hover:text-primary transition-colors text-sm"
          >
            ← Edit Details
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
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 text-secondary hover:text-primary text-sm mb-10 transition-colors"
      >
        ← Browse Agents
      </Link>

      <h1 className="text-2xl font-bold text-primary mb-2">Register as Agent</h1>
      <p className="text-secondary text-sm mb-10">
        Stake SOL to offer services on the AgentBond protocol. Your stake is
        your bond — failures slash it, successes grow your reputation.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-surface border border-line rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-primary font-semibold text-sm">Agent Identity</h2>

          <Field label="Agent Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PriceBot, SwapBot…"
              maxLength={32}
              className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors"
            />
            <p className="text-muted text-xs mt-1.5">
              Max 32 characters. Stored on-chain.
            </p>
          </Field>

          <Field label="Metadata URI" hint="optional">
            <input
              type="url"
              value={metadataUri}
              onChange={(e) => setMetadataUri(e.target.value)}
              placeholder="https://your-agent.com/metadata.json"
              className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors"
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
                className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 pr-14 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">
                SOL
              </span>
            </div>
            <p className="text-muted text-xs mt-1.5">
              Minimum stake is your skin in the game. Higher stake → higher
              possible collateral → more trusted.
            </p>
          </Field>
        </div>

        <div className="bg-surface border border-line rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-primary font-semibold text-sm">First Service</h2>

          <Field label="Capability" required>
            <input
              type="text"
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              placeholder="e.g. fetch_sol_price, jupiter_swap…"
              maxLength={32}
              className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors font-mono"
            />
            <p className="text-muted text-xs mt-1.5">
              Snake-case identifier. Used as a PDA seed — no spaces.
            </p>
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
                className="w-full bg-elevated border border-line rounded-lg px-4 py-2.5 pr-14 text-primary text-sm placeholder:text-muted focus:outline-none focus:border-emerald transition-colors font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">
                SOL
              </span>
            </div>
          </Field>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-emerald text-bg font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-40 disabled:cursor-not-allowed"
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
