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
> **Why AgentBond is worth your audit time:** this protocol will reach mainnet in Q3 2026 with real user-deposited SOL flowing through StakeVault and EscrowVault. The audit findings will not sit in a PDF — they will gate the mainnet deployment. Adevar's review will be cited in the README, linked on the live site, and form the basis of our mainnet announcement. Every future user of AgentBond will rely on this audit.
>
> **Recommended audit scope (priority order):**
> 1. **Slashing path:** `dispute_job` → `slash` instruction chain. The most security-critical flow — any flaw enables theft of agent stake.
> 2. **Escrow release:** `approve_job` instruction — must atomically pay agent + treasury or revert. Re-entry resistance.
> 3. **PDA seed determinism:** all 5 account types (`ProtocolConfig`, `AgentProfile`, `ServiceListing`, `Job`, `Bid`) — verify no collision possible.
> 4. **State machine invariants:** Job status transitions (Open → Assigned → Submitted → Approved/Disputed) — no out-of-order calls.
> 5. **Authority constraints:** `update_stake`, `claim_timeout` — verify only the intended caller can invoke each.
>
> Out of scope for the hackathon audit: frontend, off-chain bot logic, sponsor integrations. Just the 11 Anchor instructions in `agent_bond/programs/agent_bond/src/`.
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
> Implementation: SNS resolution is **already live** in `app/lib/sns.ts` and the `app/app/hooks/useSnsName.ts` hook — agent profiles in the frontend resolve through SNS reverse-lookup when an agent owns a `.sol` domain. Forward resolution (typing `pricebot.sol` to find an agent) ships in v0.2.

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

---

# Bonus tracks — verified real code, not yet submitted

Code audit confirmed these 6 sponsors are already integrated end-to-end in the AgentBond repo. Zero risk of judge pushback — all claims are backed by file paths you can cite. Submit these in order.

---

### 10. Helius — Real-Time Devnet Monitoring

**Title:**
```
AgentBond × Helius — Live Webhook-Driven Activity Feed for Slashing Events
```

**Tagline:**
```
Every AgentBond slash, bid, and dispute pushes through Helius webhooks in real time — the leaderboard at agentbond.vercel.app is live, not cached.
```

**Description:**
> AgentBond's slashing events are the most important data points in the protocol — every dispute, every slash, every stake change is a security-critical state transition. **Helius webhooks push these to our API in real-time** so the leaderboard, agent profile pages, and `/feed` activity stream are always live, never stale.
>
> **Three direct integrations:**
> - **Webhook receiver** at `/api/webhooks/helius` — Helius pushes parsed transaction data for our program (`5foUTphb...d1L3`) on every emit. We filter for `dispute_job`, `slash`, `register_agent`, `bid_on_job` and update SQLite + push to the frontend via SSE.
> - **Enhanced tx history** at `/api/webhooks/transactions/:address` — wraps Helius's parsed tx API for clean agent-profile transaction histories.
> - **Programmatic webhook registration** — when we deploy to a new cluster, our SDK auto-registers the webhook with Helius's API. Zero manual setup.
>
> **Why Helius over raw RPC:** parsing Anchor instruction data from raw transactions is brittle and error-prone. Helius's parsed format gives us instruction names, account roles, and emit logs cleanly. The live agent activity feed would not be feasible without it.
>
> Implementation: `api/routes/webhooks.ts`. Active on Devnet with the webhook URL pointing at our Render-hosted API.

---

### 11. Metaplex — Core NFT Reputation Badges

**Title:**
```
AgentBond × Metaplex Core — Portable On-Chain Reputation NFTs for AI Agents
```

**Tagline:**
```
Top agents earn Bronze → Silver → Gold → Diamond Metaplex Core NFT badges. The badge travels with the agent across any Solana platform.
```

**Description:**
> AgentBond's slash mechanic creates real on-chain reputation: agents with high stakes, high completion rates, and low slashing histories are demonstrably trustworthy. **We make that reputation portable via Metaplex Core NFTs.**
>
> Agents earn badges at protocol milestones:
> - **Bronze NFT:** 5+ completed jobs
> - **Silver NFT:** 25+ jobs, 90%+ success rate
> - **Gold NFT:** 100+ jobs, 95%+ success rate, 1+ SOL staked
> - **Diamond NFT:** 500+ jobs, 99%+ success rate, 5+ SOL staked
>
> The NFTs are minted to the agent's wallet via **Metaplex Core**. Once held, the agent can prove their AgentBond reputation on any external platform — another marketplace, a DAO, a hiring page, anywhere that supports Solana wallet verification.
>
> **Additionally:** we use the **Metaplex Agent Registry** (`@metaplex-foundation/mpl-agent-registry`) to publish each agent's identity on-chain. A consumer looking for a "swap agent" can query the registry, verify the agent's badges, and route work to them with cryptographic confidence about their track record.
>
> Implementation: `sdk/src/badges.ts` (badge minting via `mpl-core`), `sdk/src/metaplex-registry.ts` (registry write/read via `mpl-agent-registry`). Badge minting triggers automatically when an agent crosses each threshold. 10 separate files across SDK + bots reference Metaplex primitives.

---

### 12. Switchboard — On-Demand Oracle Feeds

**Title:**
```
AgentBond × Switchboard — Verifiable Oracle Agent with On-Chain Slashing
```

**Tagline:**
```
OracleBot reads cryptographically-signed Switchboard on-demand feeds and re-publishes them as accountable, slashable agent services.
```

**Description:**
> AgentBond's `OracleBot` is a hybrid product: it reads cryptographically-signed price data from **Switchboard's on-demand feeds** and re-publishes it as a paid, slashable service through the AgentBond protocol. Posters request "SOL/USD price at timestamp T" — OracleBot bids, pulls the Switchboard on-demand feed, returns the signed price + Switchboard's attestation, and submits the result hash on-chain.
>
> **Why this is interesting:** Switchboard's feeds are already cryptographically guaranteed — anyone can verify the signature. But operationally, agents need an *easy* way to *consume* signed prices on demand without managing oracle subscriptions or per-feed configuration. OracleBot is that consumer-facing wrapper — agents pay 0.005 SOL per query and get a Switchboard-signed price in their on-chain result hash.
>
> **Cross-referenced reliability:** OracleBot internally cross-references the Switchboard price against Coinbase API to detect deviation. If the difference exceeds 0.5%, the bot refuses the job rather than submitting a stale or manipulated price — protecting its stake from slashing.
>
> Implementation: `bots/oracle-bot.ts` uses `@switchboard-xyz/on-demand`. Feed configured via `SWITCHBOARD_SOL_USD_FEED` env var. 8 files across the repo reference Switchboard primitives.

---

### 13. Swig — Smart Wallet Permissions

**Title:**
```
AgentBond × Swig — Per-Bot Smart Wallet Guardrails Enforced at Wallet Level
```

**Tagline:**
```
Every AgentBond bot runs on a Swig smart wallet with scoped permissions. A rogue PriceBot physically cannot move funds — the wallet refuses to sign.
```

**Description:**
> A central question for any AI-agent marketplace: **what happens when an agent gets compromised?** AgentBond's answer is two-layered. First, the protocol slashes stake on failure. Second — and more fundamentally — **every bot runs on a Swig smart wallet with scoped permissions enforced at the wallet layer.**
>
> **Per-bot wallet presets (live on Devnet):**
> - **SwapBot, CrossChainBot:** `allButManageAuthority` — can transfer tokens (needed for swaps), cannot change wallet authorities
> - **PriceBot, OracleBot, PortfolioBot:** `programCurated` — view-only. Physically cannot move any funds, ever. A compromised PriceBot cannot drain its operator's wallet because the wallet **won't sign** transfers
> - **FailBot:** `programCurated` — demo bot, deliberately scoped to read-only
>
> **Why this matters more than typical wallet integrations:** most projects use a regular wallet and trust their code not to misuse it. AgentBond uses Swig because *we cannot trust agent code* — agent operators run third-party AI models that may be exploited. Swig moves the trust boundary from code to wallet policy. Even if the agent's TS code is compromised, the wallet refuses unauthorized actions.
>
> Implementation: `bots/swig-manager.ts` auto-provisions a Swig wallet for each bot on first boot via `@swig-wallet/classic`. `BaseBot` integrates it transparently. 8 files in the repo reference Swig primitives.

---

### 14. Coinbase x402 — Pay-Per-Request Agent Services

**Title:**
```
AgentBond × Coinbase x402 — Three Pay-Per-Use AI Services, No API Keys
```

**Tagline:**
```
Live x402-protected agent endpoints: GET /price, /swap-quote, /portfolio — pay USDC per call, no signup, no accounts.
```

**Description:**
> AgentBond exposes three pay-per-request agent services using the **x402 protocol** — the cleanest demonstration of **agent-to-agent commerce without account systems** on Solana today.
>
> - `GET /api/services/price` — **$0.001 USDC/request** — live SOL/USD price from Coinbase
> - `GET /api/services/swap-quote` — **$0.002 USDC/request** — Jupiter swap quote for any pair
> - `GET /api/services/portfolio/:wallet` — **$0.005 USDC/request** — Zerion portfolio aggregation
>
> Each endpoint is x402-protected via `x402-express` middleware. An AI agent (Claude, Cursor, elizaOS, any LLM with HTTP access) calling these endpoints handles payment automatically — no API key, no signup, no account. The x402 middleware verifies the USDC payment on Solana before serving the response.
>
> **Why this is the canonical x402 use case:** every other x402 demo is "pay-to-read." AgentBond's services are **pay-to-execute** — the agent is buying compute and signed data, not paginated content. This is where x402 will eat the API economy: not blog paywalls, but agent-to-agent service marketplaces.
>
> Implementation: `api/routes/services.ts` using `x402-express`. Receiver address configurable via `X402_RECEIVER_ADDRESS` env. Settles in USDC on Solana. 6 files reference x402 across the codebase.

---

### 15. Privy — Email-to-Stake Onboarding

**Title:**
```
AgentBond × Privy — Email-to-AgentOperator in Under 60 Seconds
```

**Tagline:**
```
Anyone with an email becomes an AgentBond agent operator. Privy auto-provisions a Solana embedded wallet — no MetaMask, no Phantom install, no seed phrase.
```

**Description:**
> AgentBond's biggest growth blocker isn't smart-contract complexity — it's wallet onboarding. Most AI engineers don't already own a Solana wallet. **Privy fixes this on `/register`.** Users sign in with email, Google, or Apple. Privy auto-provisions a Solana embedded wallet behind the scenes. Within 30 seconds of arriving on AgentBond, a user has a funded wallet ready to stake.
>
> **Combined with MoonPay onramp:** the new operator clicks "Buy SOL with Credit Card," Privy's embedded wallet receives the SOL, and they're staking on AgentBond — credit card to live agent operator in **under 60 seconds, end to end.**
>
> **Why this matters for AI agents specifically:** an AI agent operator is fundamentally different from a DeFi degen. They're a Python or TypeScript engineer who wants to monetize a model. Crypto onboarding is a tax. Privy removes the tax entirely.
>
> Implementation: `app/components/PrivyAuthProvider.tsx` wraps the entire app. Privy SDK + Solana adapter. Wallet creation is server-side, transparent to the user. 5 files reference Privy. Live on Devnet now.

---

## Combined submission plan — all 15 tracks

After bonus additions: **15 total submissions, ~90 minutes of form-filling.**

**Submit in this priority order** (rough heuristic — verify each track's prize on Superteam Earn first):

| Order | Track | Code reality | Prize estimate (verify!) |
|---|---|---|---|
| 1 | Adevar Labs Audit | ✅ Real | Possibly $50K audit credits |
| 2 | Jupiter | ✅ Real | $5K–$10K range typical |
| 3 | Zerion CLI | ✅ Real | $2K + $5K (two listings) |
| 4 | Torque MCP | ✅ Real | $2K–$5K range |
| 5 | Metaplex (Core) | ✅ Real | $5K–$15K range — usually big |
| 6 | Helius | ✅ Real | $2K–$5K |
| 7 | Switchboard | ✅ Real | $2K–$5K |
| 8 | Swig | ✅ Real | $2K–$5K |
| 9 | Coinbase x402 | ✅ Real | $5K–$10K |
| 10 | Privy | ✅ Real | $2K–$5K |
| 11 | SNS Identity | ✅ Real (code present) | $1K–$3K |
| 12 | cloak (NaCl) | ✅ Real (NaCl shipped) | varies |
| 13 | KIRAPAY | ⚠️ Roadmap | small |
| 14 | SagaPad | ⚠️ Roadmap | varies |
| 15 | MagicBlock | ⚠️ Roadmap | varies |

**Common assets at top of this doc apply to every submission** — same videos, same GitHub URL, same slash transaction proof.
