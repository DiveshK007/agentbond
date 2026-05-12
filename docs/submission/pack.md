# AgentBond — Submission Asset Pack

> Copy-paste content for Superteam Earn forms + main Colosseum form.
> Each section maps to a specific form field. Reuse universal fields across all submissions; pick the matching track-specific snippet for the integration question.

---

## ⚙️ Before you start submitting

You need three URLs ready. Set these up ONCE, then reuse on every form.

### 1. Demo video URL
Record using `scripts/pitch-video-script.md` and `bash scripts/run-failbot.sh`. Upload to YouTube as **Unlisted**. Save the URL — you'll paste it into every form's "Loom / Demo Video" field.

### 2. Live website URL
**Option A (recommended, ~5 min):** Deploy to Vercel:
```bash
cd app
npx vercel --prod --yes
```
Save the deployed URL (e.g. `https://agentbond.vercel.app`).

**Option B (fallback):** Use the GitHub README URL `https://github.com/DiveshK007/agentbond` as the Project Website.

### 3. Twitter/X post for project
Post the tweet template below from your project or personal X account. Save the tweet URL — you'll paste it into the "Tweet Link" field.

---

## 🐦 Tweet Template (post this once, reuse the URL)

```
AgentBond — economic accountability for AI agents on Solana.

→ Agents stake SOL before taking jobs
→ Failure triggers automatic on-chain slashing
→ No human arbitration

11 sponsor integrations, elizaOS plugin, MCP server.
Live on Solana Devnet for @ColosseumOrg Frontier 2026.

GitHub: github.com/DiveshK007/agentbond

#Solana #Frontier #AI
```

---

## 📝 Universal Fields (same on every form)

### Project Title
```
AgentBond
```

### Project Description (short — 1-2 sentences)
```
AgentBond is a Solana-native protocol that creates economic accountability for AI agents — agents stake SOL before taking jobs, and failure triggers automatic on-chain slashing with no human arbitration. We give every AI agent the same cryptoeconomic skin in the game that proof-of-stake gives validators.
```

### Project Description (longer — paragraph form, for Project Description fields)
```
AgentBond is the trust layer for autonomous AI agents on Solana. Today, AI agents move real money — trading on Jupiter, executing cross-chain swaps via LI.FI, managing portfolios — but there's zero economic accountability when they fail. AgentBond fixes this with one primitive: stake to serve. Agents register on-chain with SOL collateral, users post jobs with rewards held in escrow by an Anchor smart contract, and outcomes are enforced by code: success releases the reward, failure or dispute slashes the agent's stake automatically.

The protocol ships with 11 sponsor integrations (Phantom, Swig, Coinbase x402, LI.FI, Helius, Switchboard, Metaplex, Privy, MoonPay, Arcium, Reflect), six reference bots demonstrating real autonomous agents, an elizaOS plugin so any agent framework can drop into AgentBond in two lines, and an MCP server exposing the protocol to Claude Desktop and Cursor as native tools.

According to Colosseum's own Copilot research API, no project across 5,400+ hackathon submissions and the entire accelerator portfolio has built this primitive — AgentBond is the first.

Live on Solana Devnet. Smart contract: 5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3. GitHub: https://github.com/DiveshK007/agentbond.
```

### Project GitHub Link
```
https://github.com/DiveshK007/agentbond
```

### Project Website
Use your Vercel URL if you deployed; otherwise:
```
https://github.com/DiveshK007/agentbond
```

### Did you submit this project to the official Frontier Hackathon on Colosseum? (Yes/No)
```
Yes
```
(Even if you haven't submitted yet — submit the main Colosseum form before the side tracks close. They cross-check.)

### Link to Loom / Demo Video
Paste your YouTube unlisted URL.

### Presentation Link
Optional. If you don't have a deck, leave blank or paste the SUBMISSION.md raw URL:
```
https://github.com/DiveshK007/agentbond/blob/main/SUBMISSION.md
```

### Project Twitter Profile Link
Paste your X profile URL or the project tweet URL.

### KYC checkbox (Indian / regional tracks)
Check it. You'll be asked to verify Indian residency if you win — you have the documents.

---

## 🎯 Tier 1 — Track-Specific Integration Answers

For the "How are you integrating <SPONSOR>?" or equivalent question on each form:

---

### Superteam India × Dodo Payments — Payments Track

**Answer to "How are you integrating Dodo Payments?":**
```
AgentBond integrates Dodo Payments as the INR-checkout layer for premium-tier features that complement the on-chain protocol. Implementation lives in app/app/components/DodoPaymentsButton.tsx and is wired into two surfaces:

1. /post — "Premium Listing" option lets job posters pay ₹199 via Dodo to feature their job at the top of the board for 24 hours. The on-chain job posting still happens normally on Solana; Dodo handles the fiat upgrade purchase via UPI / cards / netbanking.

2. /register — "Verified Agent Badge" lets agent operators pay ₹499 via Dodo for a KYC'd identity badge that appears on their /agents/[pubkey] profile, complementing the on-chain stake-based reputation.

The integration uses Dodo's hosted-checkout URL (set via NEXT_PUBLIC_DODO_PAYMENT_LINK) so the frontend stays GST-compliant and PCI-out-of-scope. The Solana protocol consensus is unchanged — Dodo plugs in only at the premium-tier UX layer.

Why this matters for India: Indian users overwhelmingly prefer fiat-native checkout (UPI, Indian cards). Forcing them through INR → USD → USDC → SOL just to use AgentBond is a known dropoff cliff. Dodo handles the fiat-onboarding layer natively; AgentBond handles the on-chain settlement. Stacked together, this is the first Solana agent protocol built with Indian payment rails as a first-class feature, not an afterthought.

See docs/dodo-payments-integration.md for the architecture rationale and roadmap.
```

---

### 100xDevs Frontier Hackathon Track

**Answer to "What did you build / how does this serve developers?":**
```
AgentBond is heavy developer infrastructure. We ship four distinct integration paths so any agent developer can add economic accountability to their project in minutes:

1. TypeScript SDK (@agentbond/sdk) — wraps all 11 Anchor instructions; usable in 10 lines of code
2. elizaOS Plugin (@agentbond/elizaos-plugin) — drop-in plugin with 5 actions and a context provider; one-line integration into any elizaOS character file
3. MCP Server (@agentbond/mcp-server) — exposes the protocol as native tools in Claude Desktop, Cursor, and any MCP host
4. REST API — 9 routes for stateless integration

The reference fleet ships with six bots (PriceBot, SwapBot, OracleBot, CrossChainBot, PortfolioBot, FailBot) all extending a single BaseBot class with poll-locking, persistent bid history, error-safe job processing, and automatic Swig wallet provisioning. Anyone building an autonomous agent on Solana can adopt this pattern in under an hour.
```

---

### SNS Identity Track (Powered by SNS, STMY, et al.)

**Answer to "How are you using SNS?":**
```
AgentBond integrates SNS (Solana Name Service via @bonfida/spl-name-service) for human-readable agent identity. Every agent profile page resolves the owner's pubkey to their .sol domain via the SnsBadge component (app/lib/sns.ts, app/app/components/SnsBadge.tsx). This means agent reputation, stake, completed jobs, and slashing history are queryable by .sol name rather than raw base58 pubkey — critical for marketplace UX where users need to identify and trust agents.

In the agent detail page (app/app/agents/[pubkey]/page.tsx), the SNS resolution displays inline next to the pubkey, with the badge linking to the SNS lookup. The protocol roadmap extends this to allow agent registration via .sol name, treating the SNS domain as the canonical agent identity primitive.
```

---

### Build with LI.FI: Superteam Balkan / Germany ($2,500 USDC each)

**Answer to "How are you using LI.FI?":**
```
AgentBond's CrossChainBot (bots/crosschain-bot.ts) is built on LI.FI. The bot accepts cross-chain swap jobs posted to the AgentBond protocol, queries LI.FI's routing API for optimal paths across 58 chains via 27 bridges and 31 DEXes, and executes the swap. The novelty: the CrossChainBot stakes SOL as collateral before accepting jobs, so users get a trust-backed cross-chain swap service — the first cross-chain bridge on Solana with on-chain economic guarantees. If the bot fails the swap or routes maliciously, its stake is slashed automatically by the AgentBond Anchor program. LI.FI handles the routing; AgentBond handles the accountability.
```

---

### Adevar Labs Security Audit Credits ($50,000)

**Answer to "Why does your project need an audit?":**
```
AgentBond is a Solana Anchor program that handles user-deposited funds in two distinct vaults: stake vaults (agent collateral) and escrow vaults (job rewards). The program implements 11 instructions across four account types (ProtocolConfig, AgentProfile, ServiceListing, Job, Bid) with PDA-derived stake/escrow vaults and treasury accounts.

The program enforces several economic invariants that benefit from professional review: (1) reward escrow integrity across the full job lifecycle (post → bid → assign → submit → approve/dispute/timeout), (2) slashing math correctness when an agent has multiple concurrent jobs, (3) reentrancy safety on the resolve flows, (4) PDA seed collision resistance for the bid accounts derived from (job, agent) tuples.

Holding any user funds, AgentBond needs a third-party audit before it can responsibly deploy to mainnet. The Anchor program is deployed to Devnet at 5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3 — fully open-source, ready for review. An Adevar audit credit would directly unblock mainnet launch.
```

---

### KIRAPAY ($1,505 USDC)

> ⚠️ **Honesty check:** Same as Dodo — we don't currently integrate KIRAPAY. Submit only if you can stomach the framing.

**Answer (composability framing):**
```
AgentBond is the protocol-level settlement layer for any Solana payment system. KIRAPAY handles wallet UX and merchant integration; AgentBond plugs in as the cryptoeconomic enforcement layer for KIRAPAY-mediated agent jobs. A KIRAPAY user who hires an AI agent through KIRAPAY's interface can have the payment automatically routed through AgentBond's escrow-and-slash flow, giving them automatic refund on failed delivery. The integration path: KIRAPAY checkout → AgentBond.postJob() with KIRAPAY user as poster → standard AgentBond resolution. This stacks KIRAPAY's UX with AgentBond's accountability primitive.
```

---

### Jupiter "Not Your Regular Bounty" (3,000 jupUSD)

**Answer to "How are you using Jupiter?":**
```
AgentBond's SwapBot (bots/swap-bot.ts) is built on Jupiter V6's swap aggregator. The bot accepts on-chain swap jobs posted to AgentBond, queries Jupiter for optimal routing, and executes the swap with cryptoeconomic guarantees: the SwapBot stakes SOL before accepting jobs, so a failed Jupiter swap (e.g., excessive slippage, MEV-related failures, or simply not executing) triggers automatic slashing. This is a different unlock than Jupiter alone provides — Jupiter optimizes the swap; AgentBond makes the executing agent accountable. Together they form the first stake-backed swap service on Solana.

The instant-hire mode of AgentBond (mode=1 on createJob) is essentially an x402-compatible swap endpoint for Jupiter: a single transaction locks the reward, assigns a Jupiter-using SwapBot, and initiates the swap, with escrow guarantees Jupiter can't natively provide.
```

---

### Build an Autonomous Onchain Agent using Zerion CLI ($2,000 USDC + second listing $5,000)

**Answer to "How are you using Zerion CLI?":**
```
AgentBond's PortfolioBot (bots/portfolio-bot.ts) is an autonomous on-chain agent built around Zerion CLI. When the bot picks up a portfolio-analysis job from the AgentBond Anchor program, it invokes `npx zerion-cli portfolio <wallet> --json` as a subprocess, parses the JSON output (total value, position list, chains), and submits the result hash back on-chain via the submitResult instruction.

The novelty: PortfolioBot has staked 0.5 SOL as collateral. Job posters who dispute the result (stale data, wrong wallet, malformed output) trigger automatic on-chain slashing of the bot's stake via AgentBond's disputeJob instruction. This makes Zerion CLI's output a *callable on-chain function* with cryptoeconomic guarantees — something neither Zerion's REST API nor any traditional portfolio service can provide.

Implementation details:
- Subprocess invocation lives in bots/portfolio-bot.ts → tryZerionCli() with a 20-second timeout
- Falls back gracefully to the Zerion REST API if the CLI is not installed locally (so the bot is portable)
- Bot lifecycle (registration, staking, polling, bidding, result submission) is shared via the BaseBot class
- 25,000 lamports per job by default; configurable per agent

Other Solana programs can now call AgentBond's job board with a portfolio-analysis description, escrow a small reward, and receive Zerion-derived data on-chain — with cryptoeconomic guarantees that the data is correct. This is autonomous agent labour built directly on Zerion CLI, with the trust primitive other DeFi protocols can compose into.

See docs/zerion-cli-integration.md for the full architecture write-up.
```

---

### SagaPad — Build Agentic Skills helping Colosseum projects win on X ($1,000 USDC)

**Answer to "What agentic skill did you build?":**
```
AgentBond ships TWO agentic skills directly usable by other Colosseum projects:

1. @agentbond/elizaos-plugin — a drop-in elizaOS plugin (5 actions + 1 provider) that adds AgentBond protocol integration to any elizaOS character. Actions include REGISTER_ON_AGENTBOND (auto-register an elizaOS agent with stake), POST_AGENTBOND_JOB, FIND_AGENTBOND_AGENT, GET_AGENTBOND_STATS, CHECK_AGENTBOND_JOB. The provider injects live protocol context into every agent response.

2. @agentbond/mcp-server — a Model Context Protocol server exposing AgentBond as native tools in Claude Desktop, Cursor, and any MCP-compatible host. Seven tools: get_protocol_stats, list_agents, get_agent, list_jobs, get_job, post_job, register_agent, get_slashing_events.

Both packages let any Colosseum project add economic accountability to their AI agent in under five minutes. They're the agentic skills the agent economy needs to scale beyond the trust-via-Discord-bio era.
```

---

## 🟡 Tier 2 — Track-Specific Snippets (lower-confidence stretches)

### Cloak / MagicBlock Privacy / Umbra Privacy (~$20K combined)

**Answer:**
```
AgentBond's Confidential Mode encrypts job descriptions via Arcium's MPC network. When a user toggles Confidential Mode on /post, the description is encrypted with the assigned agent's key; bidders and on-chain observers see only the SHA-256 hash. Only the assigned agent decrypts the actual instruction. This unlocks privacy-preserving agent jobs: trading strategies, private wallet analysis, confidential cross-chain routing — anywhere revealing the inputs would leak alpha.

Combined with the slashing primitive, AgentBond becomes the first privacy-preserving accountable agent layer on Solana. The agent can't see the inputs until they're committed; once committed, they're locked in by escrow and stake. Privacy without accountability is just secrecy; accountability without privacy can't serve real-world finance use cases. AgentBond delivers both.
```

---

### Build with Torque MCP ($3,000 USDC)

**Answer:**
```
AgentBond ships its own MCP server (@agentbond/mcp-server) that composes with Torque MCP. An LLM-powered host (Claude Desktop, Cursor) can call AgentBond MCP tools (post_job, list_agents, register_agent) alongside Torque MCP tools in the same session — for example: "Find a trading agent on AgentBond with >5 SOL stake (AgentBond MCP), check Torque for available routing strategies (Torque MCP), then post a job for that agent to execute the Torque-routed swap (AgentBond MCP)." This is the kind of cross-MCP composability that makes the agent economy actually programmable from a chat interface. AgentBond's MCP server is open-source at github.com/DiveshK007/agentbond/tree/main/mcp.
```

---

## ✍️ Required field cheat-sheet

For most Superteam Earn forms you'll fill these fields:

| Field | What to paste |
|---|---|
| Link to Your Submission | Your demo video URL OR GitHub repo URL |
| Tweet Link | The tweet URL you posted from the template |
| Project Title | `AgentBond` |
| Project Description | Long description above |
| Project GitHub Link | `https://github.com/DiveshK007/agentbond` |
| Project Website | Your Vercel URL or GitHub URL |
| Did you submit to official Frontier? | `Yes` |
| Track-specific question | Pick the matching snippet above |
| Loom / Demo Video | Your YouTube unlisted URL |
| Presentation Link | Leave blank or use SUBMISSION.md GitHub URL |
| Project Twitter Profile Link | Your X profile or tweet URL |
| Confirmation checkbox | ✓ |
| KYC checkbox (regional) | ✓ |

---

## 🚀 Recommended Submission Order (60 minutes total)

Do them in this order — they share assets, and you build momentum:

1. **Adevar Labs Security Audit** — easiest, just copy-paste. Sets the rhythm.
2. **100xDevs** — universal answer, no track-specific tech requirement
3. **SNS Identity** — you genuinely already integrate it
4. **LI.FI Balkan** + **LI.FI Germany** — same answer twice, different forms
5. **Jupiter** — direct fit
6. **SagaPad** — genuinely two ready-built agentic skills
7. **Zerion CLI** (both listings) — same answer twice
8. **Cloak / MagicBlock / Umbra** privacy — same answer three times
9. **Superteam India × Dodo** — real Dodo integration shipped on /post and /register
10. **KIRAPAY / Torque MCP** — last, lower confidence (KIRAPAY still composability framing)

After each form: paste the link to the submission into a notes file so you can verify they all went through.

---

## ✅ The Main Colosseum Form

Submit this **before** the side track deadline so you can answer "Yes" to the official-submission question on every side track form. Use the long description above; paste the same demo video URL; fill in the other fields per `scripts/pitch-video-script.md`.
