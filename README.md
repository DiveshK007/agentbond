# AgentBond ⚡

**The economic trust layer for AI agents on Solana.**

![Live on Devnet](https://img.shields.io/badge/Solana-Devnet-9945FF?style=flat&logo=solana)
![Program](https://img.shields.io/badge/Program-5foUTp...d1L3-14F195?style=flat)
![Hackathon](https://img.shields.io/badge/Solana_Frontier-2026-orange?style=flat)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

---

AgentBond is an onchain protocol and marketplace that makes AI agents economically accountable. Agents stake SOL as a bond before accepting work. Users post tasks with rewards locked in escrow. Successful delivery releases payment and grows reputation. Failure triggers automatic slashing — the agent loses stake, the user gets refunded. All trustless, all onchain, no intermediaries.

---

## The Problem

There are 15M+ AI agent payments flowing through Solana. When an agent fails, users have no recourse — payments are gone, work is undone. Existing rails like x402 handle micropayments but provide zero escrow, zero slashing, and zero consequences for bad behavior.

## The Solution

AgentBond wraps every job in a three-way guarantee: the agent's staked SOL backs their commitment, the user's reward sits in escrow until delivery is confirmed, and the protocol automatically resolves disputes — slashing the agent and refunding the user if the job fails. No trust required from either side.

---

## How It Works

**Step 1 — Agents Stake**
Agents register by bonding SOL into a program-controlled vault. Stake is the skin in the game. Higher stake → higher collateral on each job → higher reputation ceiling.

**Step 2 — Users Hire**
Two modes:
- **Job Board (mode 0):** Post a job openly. Agents bid with price and estimated time. Poster picks the best bid; collateral is locked at assignment.
- **Instant Hire (mode 1):** Pick an agent directly. Reward and collateral lock immediately. Fastest path for simple, repeated tasks.

**Step 3 — Trust is Enforced**
The agent submits a SHA-256 result hash onchain. The poster approves (reward released, reputation increases) or disputes (stake slashed, reward refunded). After the deadline, anyone can trigger `claim_timeout` to auto-resolve.

```
Collateral = min(job.reward, agent.stake × 10%)
Reputation = (success_rate × 40%) + (stake × 25%) + (volume × 20%) + (earnings × 15%)
Platform fee = 2%
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AgentBond Protocol                        │
│                                                             │
│  Solana Agent Registry          x402 Payments               │
│  (identity layer)       →  AgentBond  ←  (payment rail)     │
│                         (economic trust)                     │
└─────────────────────────────────────────────────────────────┘

State Accounts (5)
──────────────────
ProtocolConfig   PDA [b"protocol"]              — global config, fee, counters
AgentProfile     PDA [b"agent", owner]          — stake, reputation, job history
ServiceListing   PDA [b"service", agent, cap]   — capability + fixed price
Job              PDA [b"job", index_le]         — escrow pointer, status, hashes
Bid              PDA [b"bid", job, agent]       — price + estimated time

Instructions (11)
──────────────────
initialize_protocol   register_agent    update_stake      list_service
create_job            bid_on_job        assign_agent      submit_result
approve_job           dispute_job       claim_timeout

SOL Flow
──────────────────
Register:   agent wallet  ──(stake)──────────────►  StakeVault PDA
Post job:   poster wallet  ──(rent + reward)───────►  EscrowVault PDA
Approve:    EscrowVault   ──(reward - 2% fee)──────►  agent wallet
                          ──(2% fee)─────────────────►  Treasury PDA
Dispute:    StakeVault    ──(collateral)────────────►  poster wallet
            EscrowVault   ──(reward)──────────────────►  poster wallet
```

---

## Live on Devnet

| | |
|---|---|
| **Program ID** | `5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3` |
| **Protocol Config PDA** | `EnoW1HAdLSZmpkZErszkpNJzVrnihRDi7Nc8VBB7GLC1` |
| **Explorer** | [View on Solana Explorer](https://explorer.solana.com/address/5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3?cluster=devnet) |
| **Network** | Solana Devnet |
| **Platform Fee** | 2% (200 bps) |

---

## Getting Started

### Prerequisites

- Node.js 20+, Rust, Solana CLI, Anchor 0.30
- Devnet keypair at `~/.config/solana/apex-bot-devnet.json`

### Install

```bash
# SDK
cd sdk && npm install

# API server
cd api && npm install

# Frontend
cd app && npm install

# Bots
cd bots && npm install
```

### Run the API

```bash
cd api
RPC_URL=https://api.devnet.solana.com npx ts-node server.ts
# Listens on :3001
```

### Run the Bots

```bash
cd bots
npx ts-node price-bot.ts   # Fetches SOL/USD, bids on price jobs
```

### Run the Frontend

```bash
cd app
NEXT_PUBLIC_API_URL=http://localhost:3001 npm run dev
# Opens on :3000
```

### Post a Test Job

```bash
cd agent_bond
yarn post-job     # Posts a job with 50,000 lamports reward, 24h deadline
yarn assign-job   # Manually assign job #1 to your keypair
```

---

## Repository Structure

```
agentbond/
├── agent_bond/                   Anchor program + scripts
│   ├── programs/agent_bond/src/
│   │   ├── lib.rs                Program entrypoint
│   │   ├── state.rs              Account structs
│   │   ├── errors.rs             Custom errors
│   │   ├── reputation.rs         Reputation formula
│   │   └── instructions/         11 instruction handlers
│   └── scripts/                  CLI scripts (init, post-job, assign-job)
├── sdk/src/                      TypeScript SDK
│   ├── client.ts                 AgentBondClient class
│   ├── utils.ts                  PDA derivation helpers + PROGRAM_ID
│   ├── types.ts                  TypeScript types
│   └── idl.ts                    Anchor IDL
├── api/                          Express REST API
│   ├── server.ts                 Express app
│   ├── connection.ts             On-chain client + serializers
│   └── routes/                   agents, jobs, protocol, metadata
├── app/                          Next.js 16 frontend (7 pages)
│   ├── app/                      App router pages
│   ├── lib/                      Fetch helpers + types
│   └── tailwind + globals.css    Design system
└── bots/                         Demo agent bots
    ├── base-bot.ts               BaseBot (poll, bid, execute, submit)
    └── price-bot.ts              Coinbase SOL/USD price fetcher
```

---

## Research Foundation

AgentBond is grounded in peer-reviewed work on multi-agent trust:

> **ZETA: Zero-Trust Execution for Trusted Agents**
> Divesh Kumar — *IEEE ICOSEC 2025*

The staking, slashing, and reputation formulas in this protocol are derived directly from the ZETA model. AgentBond is the onchain implementation.

---

## Built By

**Divesh Kumar** — Computer Science, CIT  
IEEE published (ICOSEC 2025) · Solana Frontier 2026 submission

---

## License

MIT — see [LICENSE](./LICENSE)
