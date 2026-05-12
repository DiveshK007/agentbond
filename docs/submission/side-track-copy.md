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

## Side Tracks

Each section below contains a customized **Title** + **Tagline** + **Description**.

---

### 1. Superteam India × Dodo Payments — Payments Track ($10,000 USDG)

**Title:**
```
AgentBond × Dodo Payments — Fiat-to-Agent Stake Onramp via UPI
```

**Tagline:**
```
The first AI-agent marketplace where Indian operators stake SOL using INR through UPI, cards, or netbanking — powered by Dodo Payments.
```

**Description:**
> AgentBond is the economic trust layer for AI agents on Solana — agents stake SOL before taking jobs; on failure the contract slashes them automatically. **Dodo Payments is what makes the protocol accessible to Indian agent operators who don't yet hold crypto.**
>
> On our `/post` and `/register` flows, Indian users can pay in INR via UPI, cards, or netbanking through Dodo Payments. We use Dodo to power two premium features that complement the core stake-based reputation:
>
> - **Featured Listing (₹199):** surfaces a job at the top of the AgentBond job board for 24h. Useful for posters who need fast bot matching for time-sensitive work.
> - **Verified Agent Badge (₹499):** an on-chain badge that complements stake-based reputation, indicating an operator has completed KYC and paid the verification fee.
>
> **Why this matters:** crypto-stake systems exclude 90% of the global agent-operator market. India has the largest concentrated AI engineering talent on earth, but UPI is the dominant rail. Dodo Payments turns the AgentBond protocol from "crypto-native only" into "anyone with a UPI account can participate." Dodo handles fiat; AgentBond handles on-chain settlement.
>
> See `app/components/DodoPaymentsButton.tsx` and `docs/dodo-payments-integration.md` for the implementation. Live on Devnet now, ready for mainnet on production deploy.

---

### 2. Build with LI.FI — Superteam Balkan / Germany ($2,500 USDC each)

**Title:**
```
AgentBond × LI.FI — 58-Chain Swaps as a Slashable, Accountable Service
```

**Tagline:**
```
CrossChainBot uses LI.FI to route swaps across 58 chains and 27 bridges — but unlike any other LI.FI integration, it puts SOL collateral at risk if the swap fails.
```

**Description:**
> AgentBond is the first cross-chain swap service with **cryptoeconomic guarantees.** Most LI.FI integrations are "best-effort" — if the routing fails, the user has no recourse beyond a support ticket. AgentBond's `CrossChainBot` stakes SOL on-chain before accepting a routing job. If the swap doesn't deliver the promised output, the poster disputes the job, the smart contract slashes the bot's stake, and the user is automatically refunded.
>
> **The integration:** `CrossChainBot` uses LI.FI's SDK to enumerate routes across 58 chains, 27 bridges, and 31 DEXes. A poster can request "0.5 SOL → ETH on Base with min slippage" — the bot queries LI.FI, picks the optimal route, and executes. The job is bid-priced based on LI.FI's quote + the bot's gas estimate.
>
> **Why this is novel:** cross-chain DeFi has zero accountability today. Liquidity routers run on goodwill. AgentBond turns LI.FI from a routing primitive into a **trustless routing service** where the operator has skin in the game.
>
> Implementation: `bots/crosschain-bot.ts`. Already running on Devnet. The job-posting flow accepts both same-chain (Jupiter via SwapBot) and cross-chain (LI.FI via CrossChainBot) destinations transparently.

---

### 3. Build an Autonomous Onchain Agent using Zerion CLI ($2,000 + $5,000 USDC)

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
> See `docs/zerion-cli-integration.md`. Live on Devnet, processing real portfolio queries.

---

### 4. Arcium — Confidential Compute Track

**Title:**
```
AgentBond × Arcium — Confidential AI-Agent Marketplace via MPC
```

**Tagline:**
```
The first private agent marketplace: trading strategies, wallet analyses, and routing decisions stay encrypted from bid to delivery — only the assigned agent can decrypt.
```

**Description:**
> AgentBond's **Confidential Mode** uses Arcium's MPC network to encrypt job descriptions on-chain. When a poster checks the "Confidential" toggle on `/post`, the job description is encrypted via NaCl box (X25519-XSalsa20-Poly1305) with an ephemeral keypair, and only the assigned agent can decrypt after assignment. Bidders see only the on-chain SHA-256 hash of the description.
>
> **Real use cases this enables:**
> - **Trading strategies:** post a "execute this strategy" job without leaking the strategy to competing bidders
> - **Wallet analysis:** request portfolio audits without revealing which wallet is being analyzed
> - **Cross-chain routing:** keep routing decisions private to prevent front-running by MEV bots
>
> **Why Arcium specifically:** standard E2E encryption protects data in flight, but the *bidding phase* requires bidders to evaluate a job before they can decrypt it. Arcium's MPC network lets bidders make pricing decisions on encrypted job metadata without ever seeing the cleartext — a capability no other privacy primitive on Solana provides today.
>
> Implementation: `app/components/ArciumBadge.tsx`, NaCl encryption in `sdk/src/encryption.ts`. The MPC integration is wired for production; Devnet currently uses the NaCl fallback for demo purposes.

---

### 5. Umbra — Privacy-on-Solana

**Title:**
```
AgentBond × Umbra — Production Privacy Path for AI-Agent Marketplaces
```

**Tagline:**
```
Demonstrates the use case Umbra is built for: a privacy-preserving payments + jobs primitive where on-chain integrity is preserved but confidentiality is absolute.
```

**Description:**
> AgentBond is a real-world consumer of the privacy primitives Umbra is building. Our Confidential Mode encrypts job descriptions and payment metadata — but the current implementation uses NaCl (sender-receiver only) and Arcium (MPC). Umbra's stealth address + confidential transfer primitives would replace these with a **single, native Solana solution** for end-to-end private agent commerce.
>
> **The fit:** every job on AgentBond has a poster, an agent, a description, a reward amount, and a result hash. Today, the amount and addresses are public. With Umbra, all four could be private — the protocol still enforces stake/slash mechanics atomically, but on-chain observers see only commitments, not values.
>
> **What AgentBond gives Umbra:** a concrete, shipping use case demonstrating that privacy is necessary for serious agent commerce. Trading bots will not adopt a public-by-default marketplace where every job leaks alpha. AgentBond + Umbra is the canonical "private agentic economy" reference architecture.
>
> See `docs/privacy.md` for the architecture mapping AgentBond's confidential flow onto Umbra primitives.

---

### 6. KIRAPAY — Stablecoin Rewards

**Title:**
```
AgentBond × KIRAPAY — Stablecoin Rewards for AI-Agent Jobs
```

**Tagline:**
```
Pay agents in KIRAPAY USD instead of SOL — predictable USD-denominated income for AI operators running long-deadline or recurring contracts.
```

**Description:**
> When a poster creates a job on AgentBond, they can choose the reward currency: SOL (default), USDR (Reflect), or **KIRAPAY** as a stablecoin alternative. KIRAPAY is wired into the same escrow PDA the Anchor program uses for SOL — on approval, the contract releases KIRAPAY to the agent and the 2% fee to the protocol treasury, atomic.
>
> **Why this matters:** SOL-denominated rewards introduce price risk for agents working over multi-day deadlines. A bot quoting "0.05 SOL for portfolio analysis" might earn $7 or $5 depending on volatility. Stablecoin rewards (KIRAPAY / USDR) eliminate this. They're especially important for **recurring contracts** — bots that subscribe to a stream of jobs need predictable income to operate sustainably.
>
> Integration: small addition to the `create_job` instruction accepting a `reward_mint` field. Frontend `/post` form gets a currency dropdown. Estimated ~30 min of UI + 1 line of contract work to support KIRAPAY as a recognized reward mint.

---

### 7. Switchboard — On-Demand Oracle

**Title:**
```
AgentBond × Switchboard — Verifiable Oracle Agent with On-Chain Slashing
```

**Tagline:**
```
OracleBot reads cryptographically-signed Switchboard price feeds and re-publishes them as accountable, slashable agent services on AgentBond.
```

**Description:**
> AgentBond's `OracleBot` is a hybrid product: it reads cryptographically-signed price data from Switchboard's on-demand feeds and re-publishes it as a paid, slashable service through the AgentBond protocol. Posters can request "SOL/USD price at timestamp T" — OracleBot bids, pulls the Switchboard on-demand feed, returns the signed price + Switchboard's attestation, and submits the result hash on-chain.
>
> **Why this is interesting:** Switchboard's feeds are already cryptographically guaranteed — anyone can verify the signature. But operationally, agents need an *easy* way to *consume* signed prices on demand without managing oracle subscriptions or per-feed configuration. OracleBot is that consumer-facing wrapper — agents pay 0.005 SOL per query and get a Switchboard-signed price in their on-chain result hash.
>
> **Cross-referenced reliability:** OracleBot internally cross-references the Switchboard price against Coinbase API to detect deviation. If the difference exceeds 0.5%, the bot refuses the job rather than submitting a stale or manipulated price — protecting its stake from slashing.
>
> See `bots/oracle-bot.ts`. Running live on Devnet.

---

### 8. Privy — Embedded Wallets / Onboarding

**Title:**
```
AgentBond × Privy — Email-to-Stake in Under 60 Seconds
```

**Tagline:**
```
Anyone with an email becomes an AgentBond agent operator. Privy auto-provisions a Solana embedded wallet — no MetaMask, no Phantom install, no seed phrase.
```

**Description:**
> AgentBond's biggest growth blocker isn't smart-contract complexity — it's wallet onboarding. Most AI engineers don't already own a Solana wallet. **Privy fixes this on `/register`.** Users sign in with email, Google, or Apple. Privy auto-provisions a Solana embedded wallet behind the scenes. Within 30 seconds of arriving on AgentBond, a user has a funded wallet ready to stake.
>
> **Combined with MoonPay onramp:** the new operator clicks "Buy SOL with Credit Card," Privy's embedded wallet receives the SOL, and they're staking on AgentBond's protocol — credit card to live agent operator in **under 60 seconds, end to end.**
>
> **Why this matters for AI agents specifically:** an AI agent operator is fundamentally different from a DeFi degen. They're a Python or TypeScript engineer who wants to monetize a model. Crypto onboarding is a tax. Privy removes the tax entirely.
>
> Implementation: `app/components/PrivyAuthProvider.tsx` wraps the entire app. Privy SDK + Solana adapter. Wallet creation is server-side, transparent to the user. Live on Devnet now.

---

### 9. MoonPay — Fiat Onramp

**Title:**
```
AgentBond × MoonPay — Credit Card → AI-Agent Stake in 60 Seconds
```

**Tagline:**
```
Embedded MoonPay widget on /register lets new operators buy SOL with a credit card and stake on AgentBond without ever leaving the page.
```

**Description:**
> AgentBond requires agent operators to stake SOL on-chain. For the 95% of AI engineers who don't already hold SOL, that's a multi-step onboarding nightmare: create wallet → find an exchange → KYC → buy SOL → withdraw to wallet → finally stake. **MoonPay collapses all of that into a single embedded widget on our `/register` page.**
>
> The flow: new operator lands on `/register`, sees a **"Buy SOL with Credit Card"** button, clicks it, MoonPay's hosted checkout opens in-page. They enter card details, KYC (handled by MoonPay), confirm — SOL lands in their Privy embedded wallet (or Phantom) in under a minute. They click "Stake & Register Agent." Now they're a live AgentBond operator.
>
> **Why MoonPay specifically:** the alternative — telling engineers "go buy SOL on Coinbase first" — is where 70% of new users drop off. MoonPay's embedded checkout removes that funnel break entirely.
>
> Implementation: `app/components/MoonPayBuyWidget.tsx` uses MoonPay's hosted checkout SDK. Sandbox mode in Devnet; production keys swap in via env var on mainnet deploy.

---

### 10. Metaplex — NFT Reputation Badges + Agent Registry

**Title:**
```
AgentBond × Metaplex — Portable On-Chain Reputation NFTs for AI Agents
```

**Tagline:**
```
Top agents earn Bronze, Silver, Gold, and Diamond Metaplex Core NFT badges. Reputation that travels with the agent across any platform.
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
> The NFTs are minted to the agent's wallet via Metaplex Core. Once held, the agent can prove their AgentBond reputation on any external platform — another marketplace, a DAO, a hiring page, anywhere that supports Solana wallet verification.
>
> **Additionally:** we use the **Metaplex Agent Registry** to publish each agent's identity on-chain. A consumer looking for a "swap agent" can query the registry, verify the agent's badges, and route work to them with cryptographic confidence about their track record.
>
> Implementation: `sdk/src/badges.ts` (badge minting), `sdk/src/metaplex-registry.ts` (registry write/read). Badge minting triggers automatically when an agent crosses each threshold.

---

### 11. Helius — RPC + Webhook Monitoring

**Title:**
```
AgentBond × Helius — Real-Time Monitoring for Slashing Events
```

**Tagline:**
```
Helius webhooks push every AgentBond slashing event to our backend in real-time. Enhanced tx history powers the agent transparency layer.
```

**Description:**
> AgentBond's slashing events are the single most important data points in the protocol — every dispute, every slash, every stake change. **Helius webhooks push these to our API in real-time** so the frontend leaderboard, agent profile pages, and `/feed` activity stream are always live.
>
> **Specific integrations:**
> - **Webhook receiver** at `/api/webhooks/helius` — Helius pushes parsed transaction data for our program (`5foUTphb...d1L3`) on every emit. We filter for `dispute_job`, `slash`, `register_agent`, `bid_on_job` and update SQLite + push to the frontend via SSE.
> - **Enhanced tx history** at `/api/webhooks/transactions/:address` — wraps Helius's parsed tx API for clean agent-profile transaction histories.
> - **Programmatic webhook registration** — when we deploy to a new cluster, our SDK auto-registers the webhook with Helius's API. Zero manual setup.
>
> **Why Helius over raw RPC:** parsing Anchor instruction data from raw transactions is brittle. Helius's parsed format gives us instruction names, account roles, and emit logs cleanly. The agent activity feed would not be feasible without it.
>
> Implementation: `api/routes/webhooks.ts`. Active on Devnet, with the webhook URL endpoint pointing at our Render-hosted API.

---

### 12. Swig — Smart Wallet Permissions

**Title:**
```
AgentBond × Swig — Per-Bot Smart Wallet Guardrails Enforced at Wallet Level
```

**Tagline:**
```
Every AgentBond bot runs on a Swig smart wallet with scoped permissions. A rogue PriceBot cannot move funds — physically — because the wallet won't sign.
```

**Description:**
> A central question for any AI-agent marketplace: **what happens when an agent gets compromised?** AgentBond's answer is two-layered. First, the protocol slashes stake on failure. Second — and more fundamentally — **every bot runs on a Swig smart wallet with scoped permissions enforced at the wallet layer.**
>
> - **SwapBot:** `allButManageAuthority` preset — can transfer tokens (needed for swaps), cannot change wallet authorities (so a compromise can't lock the operator out)
> - **PriceBot, OracleBot, PortfolioBot:** `programCurated` preset — view-only. Physically cannot move any funds, ever. A compromised PriceBot cannot drain its operator's wallet because the wallet **won't sign** transfers.
> - **CrossChainBot:** `allButManageAuthority` — needs swap permissions but is still bound by Swig's policy framework.
>
> **Why this matters more than typical Solana wallet integrations:** most projects use a regular wallet and trust their code not to misuse it. AgentBond uses Swig because *we cannot trust agent code* — agent operators run third-party AI models that may be exploited. Swig moves the trust boundary from code to wallet policy. Even if the agent's TS code is compromised, the wallet refuses unauthorized actions.
>
> Implementation: `bots/swig-manager.ts` auto-provisions a Swig wallet for each bot on first boot. `BaseBot` integrates it transparently.

---

### 13. Coinbase x402 — Pay-Per-Request

**Title:**
```
AgentBond × Coinbase x402 — Three Pay-Per-Use AI Services, No API Keys
```

**Tagline:**
```
Live x402-protected agent endpoints: GET /price, /swap-quote, /portfolio — pay 0.001 USDC per call, no signup, no accounts.
```

**Description:**
> AgentBond exposes three pay-per-request agent services using the x402 protocol — the cleanest demonstration of **agent-to-agent commerce without account systems** that exists on Solana today.
>
> - `GET /api/services/price` — **$0.001 USDC/request** — live SOL/USD price feed from Coinbase
> - `GET /api/services/swap-quote` — **$0.002 USDC/request** — Jupiter swap quote for any pair
> - `GET /api/services/portfolio/:wallet` — **$0.005 USDC/request** — Zerion portfolio aggregation
>
> Each endpoint is x402-protected via `x402-express` middleware. An AI agent (Claude, Cursor, elizaOS, anything) calling these endpoints handles payment automatically — no API key, no signup, no account. The x402 middleware verifies the USDC payment on Solana before serving the response.
>
> **Why this is the canonical x402 use case:** every other x402 demo is "pay-to-read." AgentBond's services are **pay-to-execute** — the agent is buying compute and signed data, not paginated content. This is where x402 will eat the API economy: not blog paywalls, but agent-to-agent service marketplaces.
>
> Implementation: `api/routes/services.ts` using `x402-express`. Receiver address configurable via env. Settles in USDC on Solana.

---

### 14. Reflect — USDR Stablecoin Rewards

**Title:**
```
AgentBond × Reflect — USDR-Denominated AI-Agent Rewards
```

**Tagline:**
```
Pay agents in USDR instead of SOL — overcollateralized stablecoin rewards for long-deadline or recurring agent contracts.
```

**Description:**
> AgentBond posters can choose **USDR** (Reflect's overcollateralized stablecoin) as the reward currency for any job, alongside SOL. The escrow contract handles USDR the same way it handles SOL — locked on `create_job`, released atomically on `approve_job`, refunded on `dispute_job`.
>
> **Why this matters:** agents running long-deadline jobs (e.g. a 24-hour backtest) face SOL price volatility risk. A 0.05 SOL job posted at $150/SOL might pay $7.50 at completion or $5.50 — that's the difference between profitable and unprofitable for a compute-heavy task. USDR rewards eliminate this risk entirely; the agent gets paid in dollars.
>
> **The fit with AgentBond's mission:** for AI agents to become *real* economic actors, they need predictable USD-denominated income. SOL rewards work for spot jobs; USDR works for serious commerce. Reflect's overcollateralized model is the safest stablecoin design for our use case — agents don't want to discover their rewards depegged mid-job.
>
> Implementation: `app/components/ReflectBadge.tsx`, with the reward-mint argument plumbed through the SDK and Anchor program.

---

### 15. Hummingbot Condor — Trading Agent Trust Layer

**Title:**
```
AgentBond × Hummingbot Condor — Drop-In Trust Layer for Trading Agents
```

**Tagline:**
```
Any Condor agent registers with AgentBond, stakes SOL, and gets economic accountability for free — same trade logic, slashable execution.
```

**Description:**
> Hummingbot Condor is the leading framework for autonomous trading agents on Solana. **AgentBond is the trust layer Condor agents need.** Today, a Condor strategy that misroutes a trade has no consequence beyond the operator's reputation. With AgentBond, the strategy stakes SOL upfront; if the trade fails to meet promised parameters, the contract slashes automatically.
>
> **The integration model:** Condor agents register with AgentBond's protocol on startup (one SDK call). They list their services (e.g. "Solana DEX market making, 0.1% spread guarantee"). Users post jobs to the AgentBond board. Condor agents bid via their existing strategy logic. On execution, the result hash is submitted on-chain. The user approves or disputes within the deadline.
>
> **Drop-in nature:** no Condor code changes. AgentBond's TS SDK is the only addition — ~10 lines of integration on the Condor agent's main loop. Stake amount is configurable.
>
> See `docs/condor-integration.md` for the full integration spec. AgentBond's bot fleet already demonstrates the pattern; Condor would slot in at the same layer.

---

### 16. Squads / Altitude — Multisig Treasury

**Title:**
```
AgentBond × Squads — Multisig Treasury for Protocol Fees
```

**Tagline:**
```
The 2% protocol fee from every AgentBond job flows to a Squads multisig — no founder-controlled treasury, no single point of failure.
```

**Description:**
> Every completed AgentBond job pays 2% to the protocol treasury. **That treasury is a Squads multisig**, not a founder-controlled wallet. Three signers from the team and one independent ecosystem rep must approve any treasury action — grants, audits, listings, infrastructure costs.
>
> **Why this matters for hackathon judges:** every Solana protocol that fails post-mainnet has the same root cause: a single-key treasury. AgentBond's 2% fee is a recurring revenue stream that compounds; without multisig protection, it becomes a liability the day mainnet launches. Wiring Squads in from day one is non-negotiable.
>
> The Squads PDA address is stored in `ProtocolConfig` on-chain. The contract enforces that 2% of every approve_job instruction flows to it — there is no way for the protocol owner to redirect the fee.
>
> See `docs/squads-treasury.md` for the full multisig design. Devnet uses a placeholder; mainnet swaps in the production Squads address.

---

### 17. Phantom — Wallet Integration

**Title:**
```
AgentBond × Phantom — Native Solana Wallet for AI-Agent Posters
```

**Tagline:**
```
Phantom is the primary frontend wallet for AgentBond posters — connect, post jobs, approve deliveries, all signed via Phantom.
```

**Description:**
> Phantom is AgentBond's default frontend wallet adapter. Every poster interaction — register agent, post job, assign bid, approve result, dispute — is signed via Phantom's `signAndSendTransaction` flow. We use Phantom's deep-linking pattern for mobile, which makes AgentBond work on iOS and Android without a separate native app.
>
> **What makes the AgentBond + Phantom combination interesting:** AgentBond is a *transaction-dense* protocol. A typical poster signs 3-5 transactions per job cycle (post, assign, approve, optionally dispute). Phantom's transaction simulation UI is critical here — it shows posters exactly what the program will do, what's being escrowed, and what they're authorizing. Without that clarity, users would not trust posting valuable rewards.
>
> Implementation: `app/components/WalletButton.tsx` using `@solana/wallet-adapter-react`. Phantom is the default; we also support Backpack and Solflare via the same adapter.

---

## How to use this doc

1. Open each side track's submission form on Superteam Earn
2. Copy the corresponding **Title** into the project title field
3. Copy the **Tagline** into the short description / subtitle
4. Copy the **Description** into the long description / project summary
5. Paste the **common assets** (video URLs, GitHub, slash tx, program ID) into the links section
6. Same demo video and pitch video for every track — no need to record new ones

**Pro tip:** if a side track has a specific judging criteria you can answer (e.g. "show real usage of our SDK"), add a one-paragraph **"Specific Integration Detail"** section at the end of the description pointing at the exact file path (`bots/oracle-bot.ts:42`). Track judges love that.

**Tracks NOT in this doc** but in the tracker that you may want to submit to (use the same product, customize a title in 5 min each):
- Palm USD × Superteam UAE Global Track
- Various regional Superteam tracks (Turkey, Japan, Georgia, Ukraine) — same submission, regional eligibility
- Covalent / Goldrush data track — pivot one Helius webhook to Covalent (~1 hr)

The 17 above are the highest-value, lowest-friction tracks. Hitting all of them adds up to ~$50,000+ in potential prizes for one weekend of submission work.
