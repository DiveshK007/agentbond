# AgentBond — Final Architecture (v2)

> "The economic trust layer for AI agents on Solana — agents stake to serve, users are protected by escrow, failures trigger automatic slashing and refunds."

---

## 1. Product Overview

AgentBond is an onchain protocol + marketplace that makes AI agents economically accountable.

### The Problem

15M+ AI agent payments on Solana. Zero protection when agents fail. x402 handles payments but has no escrow, no refunds, no consequences for bad behavior. The Solana Agent Registry tracks identity but explicitly excludes economic enforcement.

### The Solution

Agents stake SOL as a bond. Users post tasks with escrowed rewards. Successful completion releases payment and grows reputation. Failure triggers automatic slashing — the agent loses stake, the user gets refunded. All onchain, all trustless.

### Two Modes

| Mode | When to use | Flow | Time |
|---|---|---|---|
| **Instant Hire** | Simple, fast tasks ("fetch price", "check balance") | User picks agent → auto-escrow → agent delivers → auto-approve or dispute | Seconds |
| **Job Board** | Complex, longer tasks ("manage my DeFi for a week") | User posts → agents bid → assign best → execute → approve or dispute | Hours/days |

Both modes share the same escrow, slashing, and reputation engine. Different entry points, same trust guarantees.

---

## 2. Anchor Program: `agent_bond`

**11 instructions, 5 account types.**

### Instructions

```
─── Protocol Setup ───
1. initialize_protocol       Create global config PDA. One-time, admin only.

─── Agent Lifecycle ───
2. register_agent            Stake SOL, create AgentProfile PDA.
3. update_stake              Deposit or withdraw SOL (withdrawals only from unlocked balance).
4. list_service              Advertise a capability with a fixed price for Instant Hire mode.

─── Job Lifecycle ───
5. create_job                Post a job. Two modes:
                              mode=0 (Open): job goes to board, accepts bids
                              mode=1 (Direct): pre-assigns agent, locks collateral immediately
6. bid_on_job                Agent bids on an Open job (price + estimated time).
7. assign_agent              Poster picks a bid, locks agent collateral.
8. submit_result             Agent submits result hash (SHA-256 of off-chain result data).
9. approve_job               Poster approves. Payment released. Reputation increases.
10. dispute_job              Poster disputes. Stake slashed. User refunded.
11. claim_timeout            Anyone can call after deadline. Auto-resolves.
```

### State Accounts

```rust
// PDA: [b"protocol"] — Space: 67
pub struct ProtocolConfig {
    pub admin: Pubkey,             // 32
    pub total_agents: u64,         // 8
    pub total_jobs: u64,           // 8 (also used as job index for PDA derivation)
    pub total_volume: u64,         // 8
    pub platform_fee_bps: u16,     // 2 (200 = 2%)
    pub bump: u8,                  // 1
}

// PDA: [b"agent", owner.key()] — Space: 255
pub struct AgentProfile {
    pub owner: Pubkey,             // 32
    pub name: [u8; 32],            // 32
    pub metadata_uri: [u8; 128],   // 128
    pub stake: u64,                // 8 (total staked lamports)
    pub locked_stake: u64,         // 8 (locked in active jobs)
    pub reputation: u32,           // 4 (0-10000 basis points)
    pub completed: u32,            // 4
    pub failed: u32,               // 4
    pub consecutive_fails: u8,     // 1
    pub total_earned: u64,         // 8
    pub total_slashed: u64,        // 8
    pub registered_at: i64,        // 8
    pub status: u8,                // 1 (0=Active, 1=Suspended, 2=Deregistered)
    pub bump: u8,                  // 1
}

// PDA: [b"service", agent.key(), capability] — Space: 90
pub struct ServiceListing {
    pub agent: Pubkey,             // 32
    pub capability: [u8; 32],      // 32
    pub price: u64,                // 8
    pub is_active: bool,           // 1
    pub total_calls: u64,          // 8
    pub bump: u8,                  // 1
}

// PDA: [b"job", job_index.to_le_bytes()] — Space: 210
pub struct Job {
    pub poster: Pubkey,            // 32
    pub agent: Pubkey,             // 32
    pub description_hash: [u8; 32],// 32
    pub reward: u64,               // 8
    pub collateral: u64,           // 8
    pub deadline: i64,             // 8
    pub mode: u8,                  // 1 (0=Open, 1=Direct)
    pub status: u8,                // 1 (0=Open,1=Assigned,2=Submitted,3=Completed,4=Disputed,5=Cancelled,6=TimedOut)
    pub result_hash: [u8; 32],     // 32
    pub created_at: i64,           // 8
    pub assigned_at: i64,          // 8
    pub resolved_at: i64,          // 8
    pub job_index: u64,            // 8
    pub bump: u8,                  // 1
}

// PDA: [b"bid", job.key(), agent_owner.key()] — Space: 93
pub struct Bid {
    pub job: Pubkey,               // 32
    pub agent: Pubkey,             // 32
    pub price: u64,                // 8
    pub estimated_seconds: u32,    // 4
    pub created_at: i64,           // 8
    pub bump: u8,                  // 1
}
```

### SOL Flow

```
Registration:     Agent wallet ──(stake)──→ StakeVault PDA [b"stake_vault", agent.key()]
Job Posting:      Poster wallet ──(reward)──→ EscrowVault PDA [b"escrow", job.key()]
Approval:         EscrowVault ──(reward-fee)──→ Agent wallet; ──(fee)──→ Treasury PDA
Dispute/Slash:    StakeVault ──(collateral)──→ Poster; EscrowVault ──(reward)──→ Poster
```

### Collateral Formula

```
collateral = min(job.reward, agent.stake × 10%)
```
Limits per-job exposure while maintaining meaningful skin-in-the-game.

### Reputation Formula

```
score = (success_rate × 40%) + (stake_commitment × 25%) + (volume × 20%) + (earnings_ratio × 15%)
Range: 0-10000 (displayed as 0.00 - 100.00)
New agents start at 50.00
```

---

## 3. TypeScript SDK

```typescript
class AgentBondClient {
  // Agent ops
  registerAgent(name, metadataUri, stakeLamports): Promise<string>;
  updateStake(deposit?, withdraw?): Promise<string>;
  listService(capability, priceLamports): Promise<string>;

  // Instant Hire
  instantHire(agentPubkey, capability, deadlineSeconds): Promise<string>;

  // Job Board
  postJob(descriptionHash, rewardLamports, deadlineSeconds): Promise<string>;
  bidOnJob(jobPubkey, priceLamports, estimatedSeconds): Promise<string>;
  assignAgent(jobPubkey, agentPubkey): Promise<string>;

  // Shared
  submitResult(jobPubkey, resultHash): Promise<string>;
  approveJob(jobPubkey): Promise<string>;
  disputeJob(jobPubkey): Promise<string>;
  claimTimeout(jobPubkey): Promise<string>;

  // Queries
  getAgent(owner): Promise<AgentProfile>;
  getAllAgents(): Promise<AgentProfile[]>;
  getJob(jobIndex): Promise<Job>;
  getOpenJobs(): Promise<Job[]>;
  getProtocolStats(): Promise<ProtocolConfig>;
}
```

---

## 4. Frontend (Next.js, 7 pages)

```
/                Landing: stats ticker, how-it-works, featured agents
/agents          Agent Explorer: grid, filter by reputation/capability/stake
/agents/[pubkey] Agent Detail: full stats, services, job history, "Hire Instantly"
/jobs            Job Board: tabs (Open|In Progress|Completed|Disputed)
/jobs/[index]    Job Detail: status pipeline, bids, approve/dispute buttons
/dashboard       Wallet dashboard: my agent OR my posted jobs
/register        Register as agent + list first service
```

### Design System

```
Background: #0a0a0a    Surface: #141414     Border: #262626
Text: #fafafa/#a3a3a3  Emerald: #10b981     Red: #ef4444
Amber: #f59e0b         Blue: #3b82f6        Purple: #8b5cf6
Font: Inter + JetBrains Mono
```

---

## 5. Demo Agents

**PriceBot** — fetches SOL/USDC via Pyth, 0.5 SOL stake, responds in <5s
**SwapBot** — executes Jupiter swap, 1.0 SOL stake, responds in <15s
**FailBot** — submits garbage, 0.1 SOL stake, exists only to get slashed in the demo

---

## 6. Side Tracks ($40K-$66K target)

| Track | Prize | Integration |
|---|---|---|
| 100xDevs | $10,000 | SDK is dev tooling |
| Superteam India Payments | $10,000 | Payment flows |
| x402 | $3,000+ | Instant Hire as x402 endpoint |
| Jupiter | $3,000 | SwapBot uses Jupiter |
| SNS | $5,000 | .sol names for agents |
| Zerion | $5,000 | Demo agent via Zerion CLI |
| Umbra | $10,000 | Confidential job descriptions |

---

## 7. Build Plan (17 days)

| Phase | Days | Deliverable |
|---|---|---|
| Anchor Protocol | 1-3 | All 11 instructions deployed to devnet |
| SDK + API + Bots | 4-6 | SDK, Express API, 3 demo agents live |
| Frontend | 7-11 | 7-page Next.js app on Vercel |
| Side Tracks + Polish | 12-14 | x402, SNS, Jupiter integrations, OSS cleanup |
| Submission | 15-17 | Videos recorded, submitted to Colosseum + side tracks |

---

## 8. Repo Structure

```
agentbond/
├── programs/agent_bond/src/
│   ├── lib.rs, state.rs, errors.rs, reputation.rs
│   └── instructions/ (initialize, agent, job, resolution)
├── sdk/src/ (client.ts, types.ts, utils.ts)
├── api/ (server.ts, routes/)
├── app/ (Next.js frontend, 7 pages)
├── bots/ (price-bot.ts, swap-bot.ts, fail-bot.ts)
├── Anchor.toml, Cargo.toml, package.json
├── README.md, POSITIONING.md, BUILD_PLAN.md, LICENSE
```

---

## 9. Why This Wins

1. **Novel**: ERC-8004 explicitly excludes staking/slashing. Nobody has built economic accountability for AI agents.
2. **Real economics**: Staking, escrow, slashing, 2% platform fee. Revenue model from day one.
3. **Composable**: Works with elizaOS, Solana Agent Kit, Rig — any framework, 10 lines of SDK.
4. **Live demo with consequences**: Slash animation showing real stake loss is the jaw-dropper.
5. **Academic anchor**: IEEE ZETA paper — the only Frontier competitor with a peer-reviewed publication.
6. **Infrastructure, not AI**: Positioned as financial infrastructure. Infrastructure wins at Colosseum.
7. **Side track stacking**: 5-7 tracks worth $40K-$66K in additional prizes.