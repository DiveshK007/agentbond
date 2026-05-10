# AgentBond — Economic Trust for AI Agents on Solana

> **Agents stake SOL before taking jobs. Success pays them. Failure slashes them — automatically, on-chain, no human arbitration.**

[![Built on Solana](https://img.shields.io/badge/Built_on-Solana-9945FF?style=flat-square)](https://solana.com)
[![Live on Devnet](https://img.shields.io/badge/Status-Live_on_Devnet-00e599?style=flat-square)](https://explorer.solana.com)
[![Colosseum Frontier 2026](https://img.shields.io/badge/Colosseum-Frontier_2026-000?style=flat-square)](https://arena.colosseum.org/hackathon)

---

## The Problem

AI agents are executing trades, managing wallets, and moving real money. But there is zero economic accountability:

- Agents fail silently — users lose funds with no recourse
- Reputation lives off-chain in Discord bios, trivially fabricated
- No escrow. No collateral. No skin in the game.

As agents become more autonomous, this gap becomes a systemic risk. Someone needs to solve it before mainstream adoption forces the issue at scale.

## The Solution: Stake → Serve → Slash

AgentBond is a Solana smart contract protocol that creates **cryptoeconomic accountability** for AI agents:

```
User posts job (reward escrowed in smart contract)
        ↓
Agent stakes SOL (collateral locked on-chain)
        ↓
Agent completes job → reward released automatically
Failure or dispute  → stake slashed, user refunded
```

No arbitration. No appeals. No trust required. The contract handles it.

---

## Why This Matters

**Total Addressable Market:** Every AI agent operating with economic authority — trading bots, DeFi agents, automation services — needs this. The agentic economy is forecast at $50B+ by 2027. Today it has zero infrastructure for trust.

**Comparable analogy:** Proof-of-Stake made validators accountable. AgentBond does the same for AI agents.

**Competitive moat:** This cannot be replicated on EVM chains with the same cost profile. On Solana, a job lifecycle costs ~$0.001 in fees. On Ethereum, gas alone makes this uneconomic.

**Validated novelty:** Across 5,400+ projects in the Colosseum hackathon corpus and the full accelerator portfolio, **no team has built economic accountability for AI agents.** Closest project matches in the database have ≤0.06 cosine similarity — basically nothing. AgentBond is the first.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                 Frontend (Next.js 16 / React 19)             │
│   Agent Explorer  │  Job Board  │  Leaderboard  │  Dashboard │
├──────────────────────────────────────────────────────────────┤
│                  API Server (Express + SQLite)                │
│  Protocol Stats │ Agent CRUD │ Jobs │ x402 Services │ Health  │
├──────────────────────────────────────────────────────────────┤
│             Solana Program (Anchor/Rust — 11 instructions)   │
│   registerAgent │ postJob │ bidOnJob │ assignAgent │ slash    │
│   submitResult  │ approveJob │ disputeJob │ claimTimeout     │
├──────────────────────────────────────────────────────────────┤
│                   Bot Fleet (6 autonomous agents)            │
│   PriceBot │ SwapBot │ OracleBot │ CrossChainBot │ FailBot   │
│              Each bot has a Swig smart wallet                │
├──────────────────────────────────────────────────────────────┤
│                  AI Integration Layer                         │
│   elizaOS Plugin  │  MCP Server (Claude/LLM native tools)   │
└──────────────────────────────────────────────────────────────┘
```

**Program ID:** `5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3` (Solana Devnet)

---

## Sponsor Integrations

### Swig — Smart Wallet Guardrails
Every bot gets a **Swig smart wallet** with scoped permissions enforced at the wallet level:
- **SwapBot** — `allButManageAuthority`: can transfer tokens, cannot change wallet authorities
- **PriceBot** — `programCurated`: read-only, physically cannot move funds
- **PortfolioBot** — `programCurated`: view-only portfolio access

A rogue bot cannot exceed its permissions. The guardrails are at the wallet level, not the code level.

### Coinbase x402 — Pay-Per-Request Agent Services
Three pay-per-use endpoints, no API keys, no accounts:
- `GET /api/services/price` — $0.001 USDC/request (live SOL/USD feed)
- `GET /api/services/swap-quote` — $0.002 USDC/request (Jupiter quote)
- `GET /api/services/portfolio/:wallet` — $0.005 USDC/request (Zerion portfolio)

AI agents pay USDC per request. The x402 middleware handles payment verification.

### LI.FI — Cross-Chain Swaps
**CrossChainBot** routes swaps across 58+ chains via 27 bridges and 31 DEXes. A job posted on Solana can be executed on Ethereum, Base, or Arbitrum through one bot.

### Phantom — Wallet Integration
Primary frontend wallet for users connecting, posting jobs, and approving deliveries.

### Helius — Agent Transaction Monitoring
- Webhook receiver at `/api/webhooks/helius` — Helius pushes parsed transaction data in real-time
- Enhanced tx history at `/api/webhooks/transactions/:address`
- Programmatic webhook registration for agent registrations and slashing events

### Switchboard — On-Chain Oracle Price Feeds
**OracleBot** reads cryptographically-signed price data from Switchboard on-demand feeds. Verifiable on-chain, cross-referenced against Coinbase for deviation detection.

### Metaplex — NFT Reputation Badges + Agent Registry
Agents earn **Metaplex Core NFT badges** at milestones:
- Bronze — 5+ completed jobs
- Silver — 25+ jobs, 90%+ success rate
- Gold — 100+ jobs, 95%+ success rate, 1+ SOL staked
- Diamond — 500+ jobs, 99%+ success rate, 5+ SOL staked

Badges are on-chain credentials — portable reputation that travels with the agent across any platform. The **Metaplex Agent Registry** stores verifiable agent identity on-chain.

### Privy — Email/Social Onboarding
On `/register`, users without a crypto wallet can sign in with email, Google, or Apple. Privy auto-provisions a Solana embedded wallet — anyone with an email becomes an AgentBond user instantly. Removes the wallet-extension friction that blocks mainstream adoption.

### MoonPay — Fiat Onramp
On `/register`, the **Buy SOL with Credit Card** widget routes new agent operators through MoonPay's hosted checkout. Stake SOL without leaving the registration page — credit card → Solana wallet in under a minute.

### Arcium — Confidential Job Mode
Toggle **Confidential Mode** when posting a job to encrypt the description via Arcium's MPC network. Bidders see only the on-chain hash; only the assigned agent can decrypt. Use cases: trading strategies, private wallet analysis, confidential cross-chain routing.

### Reflect — Stablecoin Rewards (USDR)
Choose **USDR** instead of SOL when posting jobs. Reflect's overcollateralized stablecoin gives agents predictable USD-denominated income that doesn't fluctuate with SOL price — important for long-deadline jobs and recurring contracts.

### Dodo Payments — INR Checkout for Premium Features
On `/post` and `/register`, Indian users can pay in INR via UPI, cards, or netbanking through Dodo Payments. Powers the **Featured Listing** option (₹199, surfaces a job at the top of the board for 24h) and the **Verified Agent Badge** (₹499, on-chain badge complementing stake-based reputation). Dodo handles fiat; AgentBond handles on-chain settlement. See [`docs/dodo-payments-integration.md`](./docs/dodo-payments-integration.md).

---

## AI Integration Layer

AgentBond is designed to be natively integrated into any AI agent framework.

### elizaOS Plugin

```typescript
import agentBondPlugin from "@agentbond/elizaos-plugin";

// Add to any elizaOS character:
const character = {
  plugins: [agentBondPlugin],
};
```

The plugin gives any elizaOS agent:
- `GET_AGENTBOND_STATS` — query live protocol stats
- `FIND_AGENTBOND_AGENT` — search agents by capability
- `POST_AGENTBOND_JOB` — prepare a job posting
- `CHECK_AGENTBOND_JOB` — check job status or list open jobs
- **Protocol context provider** — injects live AgentBond stats into every agent response

### MCP Server (Claude / LLM Tools)

The `@agentbond/mcp-server` exposes AgentBond as native tools in Claude Desktop, Cursor, and any MCP-compatible host:

```json
{
  "mcpServers": {
    "agentbond": {
      "command": "npx",
      "args": ["@agentbond/mcp-server"],
      "env": { "AGENTBOND_API_URL": "http://localhost:3001" }
    }
  }
}
```

Available tools: `get_protocol_stats`, `list_agents`, `get_agent`, `list_jobs`, `get_job`, `post_job`, `register_agent`.

---

## Bot Fleet

| Bot | Capability | Wallet Preset | Data Source |
|---|---|---|---|
| **PriceBot** | Real-time SOL/USD feeds | Read Only | Coinbase API |
| **OracleBot** | Verifiable oracle feeds | Read Only | Switchboard |
| **SwapBot** | Token swaps on Solana | Swap Enabled | Jupiter V6 |
| **CrossChainBot** | 58-chain cross-chain swaps | Swap Enabled | LI.FI |
| **PortfolioBot** | Portfolio aggregation | View Only | Zerion API |
| **FailBot** | Slashing mechanics tester | Read Only | Demo |

All bots extend `BaseBot` which handles: poll locking, bid deduplication (persisted across restarts), error-safe job processing, and automatic Swig wallet provisioning.

---

## Privacy Layer

Confidential jobs use **NaCl box (X25519-XSalsa20-Poly1305)** — only the designated agent can decrypt the job description. On-chain integrity maintained via SHA-256 hashes. Ephemeral keypair per encryption for forward secrecy.

---

## Business Model

```
Every completed job:
  User pays reward → Escrow
  Agent completes  → 98% released to agent
  Protocol takes   → 2% to treasury

At scale (1000 jobs/day at 0.05 SOL avg):
  Daily revenue: ~1 SOL/day
  Monthly:       ~30 SOL
  Annual:        ~360 SOL ≈ $54,000 at $150/SOL
```

2% is competitive with DEX fees. Unlike DEXes, the protocol captures value on every job regardless of asset type.

---

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/agentbond.git
cd agentbond
cp .env.example .env

# Start API
cd api && npm install && npx ts-node server.ts

# Start Frontend
cd app && npm install && npm run dev

# Run a bot
cd bots && npm install && npm run price-bot

# Seed demo data (devnet)
cd bots && npx ts-node ../scripts/seed-demo.ts

# elizaOS plugin
cd elizaos-plugin && npm install && npm run build

# MCP server
cd mcp && npm install && npm run build
```

---

## Project Structure

```
agentbond/
├── programs/           Anchor smart contract (Rust, 11 instructions)
├── sdk/src/            TypeScript SDK — AgentBondClient, PDA utils, NaCl, Metaplex
├── api/                Express API (9 routes) + SQLite metadata store
├── app/                Next.js 16 frontend — 10 pages, Terminal Noir design
├── bots/               6 autonomous bots extending BaseBot
├── elizaos-plugin/     @agentbond/elizaos-plugin — native elizaOS integration
├── mcp/                @agentbond/mcp-server — MCP tools for Claude/LLM hosts
└── scripts/            seed-demo.ts, check-env.ts
```

---

## Sponsor Integration Summary

| # | Sponsor | Integration | Where |
|---|---|---|---|
| 1 | **Swig** | Smart wallet per bot, scoped permissions | `bots/swig-manager.ts`, `BaseBot` |
| 2 | **Coinbase x402** | Pay-per-request agent services | `api/routes/services.ts` |
| 3 | **LI.FI** | CrossChainBot — 58-chain swap routing | `bots/crosschain-bot.ts` |
| 4 | **Phantom** | Primary frontend wallet | `app/components/WalletButton.tsx` |
| 5 | **Helius** | Webhook monitoring + tx history | `api/routes/webhooks.ts` |
| 6 | **Switchboard** | On-chain oracle price feeds | `bots/oracle-bot.ts` |
| 7 | **Metaplex** | NFT badges + agent identity registry | `sdk/src/badges.ts`, `sdk/src/metaplex-registry.ts` |
| 8 | **Privy** | Email/Google/Apple → embedded Solana wallet | `app/components/PrivyAuthProvider.tsx` |
| 9 | **MoonPay** | Credit-card → SOL onramp on `/register` | `app/components/MoonPayBuyWidget.tsx` |
| 10 | **Arcium** | Confidential job mode (MPC encryption) | `app/components/ArciumBadge.tsx` |
| 11 | **Reflect** | USDR stablecoin rewards | `app/components/ReflectBadge.tsx` |
| 12 | **Dodo Payments** | INR checkout for premium-tier features | `app/components/DodoPaymentsButton.tsx` |
| 13 | **Zerion CLI** | PortfolioBot uses `npx zerion-cli` as a subprocess | `bots/portfolio-bot.ts` |
| 14 | **Hummingbot Condor** | Drop-in trust layer for Condor trading agents | `docs/condor-integration.md` |
| 15 | **Squads / Altitude** | Multisig treasury for the protocol | `docs/squads-treasury.md` |

**15 sponsor integrations** — spanning wallets, payments, fiat ramps, oracles, cross-chain, monitoring, identity, privacy, stablecoins, INR rails, autonomous-agent harnesses, and treasury security.

---

MIT License
