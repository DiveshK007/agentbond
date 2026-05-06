# 🤖 AgentBond — Economic Trust for AI Agents

> **Solana-native protocol where AI agents stake SOL to serve. Users are protected by escrow. Failures trigger automatic slashing — no human arbitration needed.**

[![Built on Solana](https://img.shields.io/badge/Built_on-Solana-9945FF?style=flat-square)](https://solana.com)
[![Live on Devnet](https://img.shields.io/badge/Status-Live_on_Devnet-10b981?style=flat-square)](https://explorer.solana.com)
[![Frontier 2026](https://img.shields.io/badge/Colosseum-Frontier_2026-000?style=flat-square)](https://arena.colosseum.org/hackathon)

---

## 🎯 Problem

AI agents are handling real money, executing trades, and making decisions — but there's **zero economic accountability**. When an agent fails or disappears:

- Users lose their funds with no recourse
- Reputation is off-chain and trivially gameable
- There's no escrow, no slashing, no skin in the game

## 💡 Solution

**AgentBond** is a Solana smart contract protocol that creates **trustless economic relationships** between users and AI agents:

1. **Agents Stake** → Bond SOL before accepting jobs. Real skin in the game.
2. **Users Hire** → Post jobs with escrowed rewards locked in smart contracts.
3. **Trust Enforced** → Success pays the agent. Failure slashes stake and refunds the user automatically.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│    Phantom Wallet │ Agent Cards │ Job Board │ Dashboard      │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Express)                        │
│   Protocol Stats │ Agent CRUD │ Job Mgmt │ x402 Services     │
├─────────────────────────────────────────────────────────────┤
│                   Solana Program (Anchor)                     │
│  Agent Profiles │ Service Listings │ Jobs │ Escrow │ Slash   │
├─────────────────────────────────────────────────────────────┤
│                     Bot Fleet                                │
│ PriceBot │ SwapBot │ CrossChainBot │ PortfolioBot │ FailBot  │
│         Each bot has a Swig smart wallet                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Sponsor Integrations

### 🔐 Swig — Smart Wallet Guardrails
Every AI agent gets a **Swig smart wallet** with scoped permissions:
- **SwapBot** → `allButManageAuthority` — can transfer tokens but cannot change wallet authorities
- **PriceBot** → `programCurated` — read-only, cannot move any funds
- **PortfolioBot** → `programCurated` — view-only portfolio access

This means a rogue bot **physically cannot** exceed its permissions — the guardrails are enforced at the wallet level.

### 💳 x402 (Coinbase) — Pay-Per-Request Services
Agent services are exposed as **x402 payment-gated HTTP endpoints**:
- `GET /api/services/price` — $0.001/request (SOL/USD feed)
- `GET /api/services/swap-quote` — $0.002/request (Jupiter quote)
- `GET /api/services/portfolio/:wallet` — $0.005/request (Portfolio summary)

No API keys. No accounts. AI agents pay USDC per request and get instant access.

### 🌐 LI.FI — Cross-Chain Swaps
The **CrossChainBot** uses LI.FI to swap across 58+ chains via 27 bridges and 31 DEXes. One bot, every chain.

### 👻 Phantom — Wallet Integration
Phantom is the primary wallet for users interacting with the frontend — connecting, posting jobs, and approving deliveries.

---

## 🤖 Bot Fleet

| Bot | What It Does | Swig Preset | Data Source |
|---|---|---|---|
| **PriceBot** | Real-time SOL/USD feeds | Read Only | Coinbase API |
| **SwapBot** | Token swaps on Solana | Swap Enabled | Jupiter V6 |
| **CrossChainBot** | Cross-chain swaps (58+ chains) | Swap Enabled | LI.FI API |
| **PortfolioBot** | Portfolio aggregation | View Only | Zerion API |
| **FailBot** | Tests slashing mechanics | Read Only | Demo |

---

## 🔒 Privacy Layer

AgentBond includes an **Umbra-style encryption module** for confidential jobs:
- Job descriptions are encrypted using **NaCl box (X25519)** — only the designated agent can decrypt
- On-chain integrity maintained via description hashes
- Ephemeral keypair per encryption for forward secrecy

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/agentbond.git
cd agentbond

# Copy environment config
cp .env.example .env

# Frontend
cd app && npm install && npm run dev

# API Server
cd api && npm install && npx ts-node server.ts

# Run a bot
cd bots && npm install && npm run price-bot
```

---

## 📁 Project Structure

```
agentbond/
├── app/                    # Next.js frontend
│   ├── app/
│   │   ├── components/     # AgentCard, SwigBadge, WalletButton, SnsBadge
│   │   ├── agents/         # Agent listing + detail pages
│   │   ├── jobs/           # Job board + detail pages
│   │   ├── dashboard/      # Wallet-connected dashboard
│   │   └── post/           # Job posting form
│   └── lib/                # API client, SNS resolution, types
├── api/                    # Express API server
│   └── routes/
│       ├── agents.ts       # Agent CRUD
│       ├── jobs.ts         # Job management
│       ├── services.ts     # x402 payment-gated endpoints
│       ├── swig.ts         # Swig wallet registry
│       └── metadata.ts     # Off-chain job metadata
├── bots/                   # Autonomous agent bots
│   ├── base-bot.ts         # BaseBot with Swig auto-provisioning
│   ├── swig-manager.ts     # Swig wallet provisioning + permissions
│   ├── swap-bot.ts         # Jupiter V6 integration
│   ├── crosschain-bot.ts   # LI.FI cross-chain swaps
│   ├── portfolio-bot.ts    # Zerion portfolio aggregation
│   └── price-bot.ts        # Coinbase price feeds
├── sdk/                    # TypeScript SDK
│   └── src/
│       ├── client.ts       # AgentBondClient
│       ├── confidential.ts # NaCl encryption module
│       ├── types.ts        # Shared types
│       └── utils.ts        # PDA derivation utilities
└── programs/               # Anchor smart contracts
    └── agent_bond/         # Solana program
```

---

## 🏆 Hackathon Tracks

| Track | Coverage |
|---|---|
| **Agents + Tokenization** | Core product — agent registration, staking, reputation |
| **Payments + Commerce** | x402 pay-per-request, Swig wallet payments |
| **DeFi + Stablecoins** | Jupiter swaps, LI.FI cross-chain |
| **Privacy + Confidential Compute** | Umbra encryption for private jobs |
| **Treasury + Security** | Swig scoped permissions, automatic slashing |

---

## 📄 License

MIT

---

**Built for [Colosseum Frontier 2026](https://arena.colosseum.org/hackathon) 🏛️**
