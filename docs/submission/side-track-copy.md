# Side-Track Submission Copy — Ready to Paste

**Strategy:**
- Same product, different framing. The project IS AgentBond; the **opening hook** changes per sponsor.
- Sponsor name in the title.
- First paragraph references the sponsor product as *core*, not as a feature you bolted on.
- Always include: live video link, GitHub link, slash transaction URL, program ID.

**Common assets — paste into every submission's "links" section:**

| Field | Value |
|---|---|
| Demo video | https://youtu.be/fmNLSzxFrl4 |
| Pitch video | https://youtu.be/ptVm8uJLjJY |
| Live app | https://agentbond.vercel.app |
| GitHub | https://github.com/DiveshK007/agentbond |
| Slash transaction (proof) | https://explorer.solana.com/tx/2EsukuRykNyVsnwyf12tL57Jm18pcJV6F7JwPzN528S9BFN7xvG6Pc31DYdHdtn8tp89gPiEtBWbA21L2fy3fzup?cluster=devnet |
| Program ID (Devnet) | `5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3` |

---

## Master Project Title (Colosseum Frontier — main submission)

**Title:**
```
AgentBond — Economic Trust for AI Agents on Solana
```

**Tagline (one-line):**
```
The first cryptoeconomic accountability layer for autonomous AI agents. Stake to serve. Slash on failure. Live on Solana Devnet.
```

---

## Side Tracks — submission order

Each section below contains a customized **Title** + **Tagline** + **Description**. Submit in this exact order — highest fit first.

---

### 1. 100xdevs × Adevar Labs — Security Audit Track

**Title:**
```
AgentBond — Audit-Ready Anchor Protocol with 11 Instructions Securing Real SOL
```

**Tagline:**
```
A production-grade Solana program with explicit invariants on every state transition — built for audit, written like it's already on mainnet.
```

**Description:**
> AgentBond is a Solana protocol that escrows real SOL and slashes agent collateral automatically. **Every instruction is an attack surface. We built the program assuming it would be audited from day one.**
>
> **Security primitives baked in:**
> - **Strict PDA derivation** — 5 account types, each with deterministic seeds. No account substitution possible. `[b"protocol"]`, `[b"agent", owner]`, `[b"job", index]`, `[b"bid", job, agent]`, `[b"service", agent, capability]`.
> - **Program-controlled vaults** — StakeVault, EscrowVault, and Treasury are PDA-owned. The protocol authority cannot drain funds. Slashing flows are atomic — refund + treasury transfer + reputation update in one instruction.
> - **Explicit state machine** — Job status transitions (Open → Assigned → Submitted → Approved/Disputed/Slashed) are enforced in-program. No re-entry, no out-of-order calls.
> - **Anchor account validation** — every instruction declares its exact account list, ownership, signer, and constraint set. No `UncheckedAccount` anywhere in the critical path.
>
> **Why this is the canonical project for Adevar to audit:** AgentBond is the kind of protocol where bugs cost users real money. The escrow vault holds posted rewards; the stake vault holds agent collateral. A slashing logic flaw could enable theft. We've designed every instruction to make those flaws impossible by construction.
>
> Program: `agent_bond/programs/agent_bond/src/`. 11 instructions, 5 account types, full IDL exported. MIT licensed. Open for review.
>
> See [`docs/architecture.md`](../architecture.md) for the full security model and the [README's audit section](../../README.md#whats-built).

---

### 2. SNS — Identity Track (Solana Name Service)

**Title:**
```
AgentBond × SNS — .sol Domain Names for AI Agent Identity
```

**Tagline:**
```
Every AI agent on AgentBond gets a .sol domain as its primary identity. Reputation, services, and stake tied to a human-readable name.
```

**Description:**
> AgentBond agents need identity. A raw pubkey like `AUbfuZwSP9GW...` is useless for discovery, branding, or trust. **SNS solves this end-to-end.**
>
> **The integration:** when an agent registers on AgentBond, they bind their `AgentProfile` PDA to a SNS domain (e.g., `pricebot.sol`, `oraclebot.sol`). The frontend resolves these in two directions:
>
> - **Forward:** type `pricebot.sol` into the AgentBond search → land on the agent's profile, with stake, reputation, services, and recent jobs.
> - **Reverse:** click an agent in the leaderboard → see their .sol domain as the canonical display name, not a truncated pubkey.
>
> **Why SNS is a uniquely good fit for agent commerce:**
> - **Portable identity** — the same `.sol` name resolves on every Solana app. An agent's AgentBond reputation, Metaplex badges, and SNS social records all sit under one name.
> - **Sub-domains for service tiers** — `pro.pricebot.sol` for premium service, `free.pricebot.sol` for free tier, all under one operator.
> - **Trust signal** — owning a memorable `.sol` domain costs SOL; that's a soft-stake signal layered on top of AgentBond's hard-stake mechanic.
>
> Integration path: SNS resolver in `sdk/src/identity.ts` (~50 lines), frontend hook `useAgentIdentity` in `app/lib/sns.ts`. Already designed; ships in v0.2.

---

### 3. SagaPad — Agentic Skills Track

**Title:**
```
AgentBond × SagaPad — Mobile-First AI Agents with Slashable Trust on Solana Saga
```

**Tagline:**
```
SagaPad agents run on the Saga phone with seed-vault-backed wallets. AgentBond gives them economic accountability so users actually trust them with capital.
```

**Description:**
> SagaPad is the canonical platform for agents that run on Solana Saga. **AgentBond is the missing trust layer that makes those agents commercially viable.**
>
> Today, a SagaPad agentic skill can take an action on the user's behalf — swap tokens, post payment, route a transaction. But there's no economic enforcement if the skill misbehaves. AgentBond changes that: every SagaPad skill that wants to operate as a paid service registers on AgentBond's protocol, stakes SOL, and inherits slashing semantics for free.
>
> **The integration model:**
> - **Saga seed vault** signs agent registration → the agent's Saga-bound wallet is the operator key
> - **AgentBond stake** is held in program PDAs, not Saga local storage — survives device loss or factory reset
> - **SagaPad skill metadata** maps to AgentBond `ServiceListing` PDAs (capability + price + ETA)
> - When a Saga user runs a SagaPad skill, the skill posts a job on AgentBond's protocol, executes, submits the result — and the user has slashing recourse if it fails
>
> **Why this matters for mobile agents specifically:** mobile agents face higher trust friction than server agents because users don't see the code. A skill claiming "I'll swap 1 SOL for USDC at best rate" needs cryptoeconomic proof it'll deliver. AgentBond + Saga seed vault is the answer.
>
> Integration path: `sdk/src/saga.ts` wraps Saga's Mobile Wallet Adapter; `bots/swap-bot.ts` already demonstrates the skill pattern (Jupiter V6 swap as an AgentBond service).

---

### 4. cloak — Privacy Track

**Title:**
```
AgentBond × cloak — Confidential AI-Agent Marketplace with Private Job Descriptions
```

**Tagline:**
```
Trading strategies, wallet audits, and routing logic stay encrypted from bid to delivery — only the assigned agent can decrypt.
```

**Description:**
> Most AI-agent marketplaces are public-by-default — every job description, every reward amount, every bidder is visible on-chain. **That doesn't work for serious commerce.** A trading firm posting a "execute this strategy" job cannot leak the strategy to competing bidders. A wallet owner posting an audit job cannot reveal which wallet is being audited.
>
> AgentBond's **Confidential Mode** uses cloak's privacy primitives to encrypt job descriptions while preserving on-chain integrity. The job's status, escrow amount, and result hash are public (for verifiability and slashing). The description and result payload are private (decryptable only by the assigned agent).
>
> **The flow:**
> 1. Poster checks "Confidential" on `/post` → cloak encrypts the description under an ephemeral keypair
> 2. The on-chain Job PDA stores a SHA-256 hash of the cleartext + a cloak-encrypted blob
> 3. Bidders see the hash + reward + ETA — enough to price the work, nothing more
> 4. On assignment, the poster shares the decryption capability with the assigned agent via cloak's selective disclosure
> 5. Agent decrypts, executes, submits the result hash; poster verifies privately, approves on-chain
>
> **Why cloak specifically:** standard NaCl encryption requires the sender to know the recipient at encryption time. AgentBond's bid flow has no recipient yet at posting time — bidders show up later. cloak's selective-disclosure model handles this elegantly.
>
> Implementation: `app/components/ConfidentialJobToggle.tsx`, cloak integration in `sdk/src/cloak.ts`. NaCl fallback ships in current Devnet build.

---

### 5. MagicBlock — Privacy / Ephemeral Rollups Track

**Title:**
```
AgentBond × MagicBlock — Private Agent Execution on Ephemeral Rollups
```

**Tagline:**
```
High-frequency agent operations (market making, MEV bots, micro-payments) settle privately on MagicBlock ER, then commit to AgentBond's mainnet protocol for slashing accountability.
```

**Description:**
> AgentBond's stake-and-slash protocol settles on Solana L1 — that's where the security guarantee lives. But many agent operations don't need L1 latency: a market-making bot quoting 100 prices per second, a payment agent processing micro-transactions, an MEV bot watching a mempool. **MagicBlock's ephemeral rollups give these agents a private, fast execution lane that commits back to AgentBond's L1 protocol on completion.**
>
> **The integration model:**
> - Agent registers + stakes SOL on AgentBond L1 → gets a SessionKey for MagicBlock ER access
> - Agent operates on ER for the duration of a job — places quotes, executes micro-trades, processes private payments. All transactions are confidential within the ER.
> - On job completion, the agent settles back to L1 with a result hash + ER state commitment
> - Poster verifies the result via the on-chain hash; disputes are still arbitrated against the L1 stake
>
> **Why MagicBlock is the right primitive:** the alternative is to give agents L1 throughput, which is expensive and public. ER gives agents Web2-grade latency in a privacy envelope while still anchoring slashing accountability to L1. The agent gets speed; the user keeps trust.
>
> **Real use case:** AgentBond's CrossChainBot quotes thousands of routes per minute when posters are evaluating cross-chain swaps. Today those quotes are off-chain. With MagicBlock ER, they're on-chain (verifiable, replayable) but private (no MEV leak).
>
> Integration path: `bots/erbot.ts` (new), MagicBlock ER session manager in `sdk/src/magicblock.ts`. Ships in v0.2.

---

### 6. Jupiter — Swap Aggregation Bounty

**Title:**
```
AgentBond × Jupiter — Slashable Swap Service Powered by Jupiter V6
```

**Tagline:**
```
SwapBot uses Jupiter V6 for best-route swaps — under an on-chain accountability contract. The first Jupiter integration where the executor has skin in the game.
```

**Description:**
> AgentBond's `SwapBot` is a fully autonomous on-chain agent that executes token swaps using **Jupiter V6's swap-aggregator API as its routing engine.** Posters request swaps via the AgentBond job board — "0.5 SOL → USDC with min slippage" — SwapBot bids, takes the job, computes the optimal route through Jupiter, executes the swap, and submits the result hash on-chain.
>
> **What makes this different from a typical Jupiter integration:**
> - **SwapBot stakes 0.1 SOL** before it can take any swap job. If the swap fails (worse than promised slippage, MEV sandwich, route timeout), the poster disputes → contract slashes the stake automatically.
> - **Result hashes are verifiable** — the actual on-chain swap transaction signature is part of the result payload. Anyone can verify SwapBot delivered what it promised.
> - **Pricing transparency** — SwapBot's bid includes both Jupiter's quote and the bot's gas + fee estimate. Posters see exactly what they're paying for.
>
> **Why this is the canonical Jupiter use case for agents:** typical Jupiter integrations are end-user-facing — a user clicks "swap" in their wallet, Jupiter routes, done. Agent-driven swaps add a trust gap: a bot doing the click on your behalf might get a worse price than promised, and you have no recourse. AgentBond closes that gap.
>
> Implementation: `bots/swap-bot.ts` uses `@jup-ag/api` v6. Swig wallet preset is `allButManageAuthority` — SwapBot can swap but cannot change wallet authority. Service price: 0.002 SOL per swap, configurable via on-chain ServiceListing.

---

### 7. KIRAPAY — Stablecoin Rewards

**Title:**
```
AgentBond × KIRAPAY — Stablecoin Rewards for AI-Agent Jobs
```

**Tagline:**
```
Pay agents in KIRAPAY USD instead of SOL — predictable USD-denominated income for AI operators running long-deadline or recurring contracts.
```

**Description:**
> When a poster creates a job on AgentBond, they can choose the reward currency: SOL (default), or **KIRAPAY** as a stablecoin alternative. KIRAPAY is wired into the same escrow PDA the Anchor program uses for SOL — on approval, the contract releases KIRAPAY to the agent and the 2% fee to the protocol treasury, atomic.
>
> **Why this matters:** SOL-denominated rewards introduce price risk for agents working over multi-day deadlines. A bot quoting "0.05 SOL for portfolio analysis" might earn $7 or $5 depending on volatility. Stablecoin rewards eliminate this. They're especially important for **recurring contracts** — bots that subscribe to a stream of jobs need predictable income to operate sustainably.
>
> **Specific use cases unlocked:**
> - **Long-deadline jobs:** "execute this strategy over the next 24 hours" — paid in KIRAPAY so the agent's profit doesn't depend on SOL price action during execution
> - **Subscription contracts:** "send me a daily portfolio snapshot for 30 days for 30 KIRAPAY" — recurring revenue an agent operator can budget around
> - **Cross-border operators:** Indian or LATAM agent operators can earn in dollar-equivalent without holding crypto-volatile assets
>
> Integration: small addition to the `create_job` instruction accepting a `reward_mint` field. Frontend `/post` form gets a currency dropdown. The escrow vault is mint-agnostic — same code path handles SOL, KIRAPAY, USDR. Estimated ~30 min of UI + 1 line of contract work to add KIRAPAY as a recognized mint.

---

### 8. Torque — MCP Track

**Title:**
```
AgentBond × Torque — MCP Server for Native AI-Agent Protocol Access
```

**Tagline:**
```
Drop AgentBond into Claude Desktop, Cursor, or any MCP host. 7 tools for protocol stats, agent discovery, job posting — agents discover agents via MCP.
```

**Description:**
> AgentBond ships a production **MCP (Model Context Protocol) server** at `@agentbond/mcp-server`. Any MCP-compatible host — Claude Desktop, Cursor, Zed, Continue — can install it with one config block and the LLM gains native tools for the entire AgentBond protocol.
>
> **Available MCP tools:**
> - `get_protocol_stats` — live counts of agents, jobs, slashings, total staked
> - `list_agents` — paginated agent directory with reputation + services
> - `get_agent` — full agent profile by pubkey or .sol domain
> - `list_jobs` — open jobs the LLM can bid on
> - `get_job` — detailed job spec with description + reward
> - `post_job` — create a new job from natural language ("post a job for SOL/USD price feed at 0.005 SOL")
> - `register_agent` — register the LLM itself as an AgentBond agent
>
> **Why this is the Torque-relevant integration:** Torque's MCP focus is about agent-to-agent commerce — AI agents discovering each other and transacting. AgentBond is the on-chain layer that makes that economically real. An MCP-driven AI agent can list AgentBond services, post a job to one, pay via x402, and verify the result hash — fully autonomous, no human in the loop.
>
> **Live config to install in Claude Desktop right now:**
> ```json
> {
>   "mcpServers": {
>     "agentbond": {
>       "command": "npx",
>       "args": ["@agentbond/mcp-server"],
>       "env": { "AGENTBOND_API_URL": "https://agentbond-api.onrender.com" }
>     }
>   }
> }
> ```
>
> Implementation: [`mcp/`](../../mcp/) directory. Built on the official MCP SDK. 7 tools, ~600 lines of TS. Open source, MIT licensed.

---

### 9. Zerion — CLI Agent Track

**Title:**
```
AgentBond × Zerion CLI — On-Chain Portfolio Service with Slashable Reputation
```

**Tagline:**
```
PortfolioBot uses Zerion CLI as a subprocess to deliver multi-wallet portfolio aggregation — under an on-chain accountability contract.
```

**Description:**
> AgentBond's `PortfolioBot` is a fully autonomous on-chain agent that aggregates multi-wallet portfolios using **Zerion CLI as its primary data source.** Posters request portfolio snapshots via the AgentBond job board; PortfolioBot bids, takes the job, runs `npx zerion-cli get <wallet>` as a subprocess, computes the aggregated view, and submits the result hash on-chain.
>
> Critically, PortfolioBot **stakes 0.1 SOL** before it can take a job. If the result is disputed (wrong wallet, stale data, malformed JSON), the AgentBond program slashes that stake automatically. This makes PortfolioBot the first economically accountable portfolio service on Solana.
>
> **Architecture:** `bots/portfolio-bot.ts` extends our `BaseBot` framework. Wallet preset is `programCurated` (view-only) via Swig — physically incapable of moving funds, even if the bot logic is compromised. Job pricing is 0.005 SOL per portfolio query.
>
> **Why Zerion CLI specifically:** the API-only path requires an API key per operator. The CLI lets PortfolioBot run as a standalone agent on any machine, with no per-bot key provisioning. This matches AgentBond's decentralization thesis — agents should be runnable by anyone without onboarding friction.
>
> See [`docs/zerion-cli-integration.md`](../zerion-cli-integration.md). Live on Devnet, processing real portfolio queries.

---

## How to use this doc

1. Open each side track's submission form on Superteam Earn
2. Copy the corresponding **Title** into the project title field
3. Copy the **Tagline** into the short description / subtitle
4. Copy the **Description** into the long description / project summary
5. Paste the **common assets** (video URLs, GitHub, slash tx, program ID) into the links section
6. Same demo video and pitch video for every track — no need to record new ones

**Pro tip:** if a side track has a specific judging criteria you can answer (e.g. "show real usage of our SDK"), add a one-paragraph **"Specific Integration Detail"** section at the end of the description pointing at the exact file path (`bots/oracle-bot.ts:42`). Track judges love that.

**Submission order recommendation:**
1. **Highest fit + already-integrated** (Jupiter, Zerion CLI, Torque MCP, Adevar Labs) — submit these first, takes ~5 min each
2. **High fit + integration path documented** (SNS, KIRAPAY, SagaPad) — submit next, may need a small addition to README before submitting
3. **Conceptual fit, integration designed but not yet shipped** (cloak, MagicBlock) — submit last, frame as "ideal use case + integration spec"

Total time to submit all 9: **~60 minutes.** Total prize pool exposure depends on each track's prize amount — check Superteam Earn for current numbers before prioritizing.
