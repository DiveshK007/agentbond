# AgentBond — Frontier 2026 Submission Tracker

> **Deadline: May 12, 2026 (~2 days remaining)**
> **Total prize pool across side tracks: $437,914 over 54 tracks**

This document maps every Frontier side track to AgentBond's eligibility and recommended action. Each ✅ track is one separate submission on Superteam Earn — your project qualifies.

---

## Tier 1 — APPLY IMMEDIATELY (clear eligibility, ~6 tracks, ~$32K combined)

These are direct fits. Submit to each one. Each takes ~10 min on Superteam Earn (re-using the same demo video and writeup is fine).

### ✅ Superteam India × Dodo Payments — Payments Track (10,000 USDG ≈ $10,000)
- **Why eligible:** You're Indian, building in India. AgentBond IS payment infrastructure (escrow + agent compensation + 2% protocol fee).
- **Pitch angle:** "Programmable payments with cryptoeconomic accountability — every job is an escrowed payment that auto-releases on completion or auto-refunds on failure."
- **Search on Earn:** "Payments Track | Superteam India x Dodo Payments"

### ✅ 100xDevs Frontier Hackathon Track ($10,000 USDC)
- **Why eligible:** Open to all developers. AgentBond is heavy dev tooling: TypeScript SDK, elizaOS plugin, MCP server, 6 reference bots, complete shell scripts.
- **Pitch angle:** "Drop-in trust infrastructure for any agent framework. SDK + elizaOS plugin + MCP server = three integration paths, ten lines of code each."
- **Search on Earn:** "100xDevs Frontier Hackathon Track"

### ✅ SNS Identity Track — SNS, STMY, et al. ($5,000 USDC)
- **Why eligible:** AgentBond already integrates `@bonfida/spl-name-service` — the `SnsBadge` component resolves agent owner addresses to `.sol` names on agent detail pages.
- **Pitch angle:** "Every AgentBond agent gets a human-readable `.sol` identity. Reputation, stake, and slashing history are queryable by SNS name, not raw pubkey."
- **Where to look:** `app/lib/sns.ts`, `app/app/components/SnsBadge.tsx`, `app/app/agents/[pubkey]/page.tsx:174`

### ✅ Build with LI.FI: Superteam Balkan ($2,500 USDC)
- **Why eligible:** Your `CrossChainBot` already uses LI.FI. Just submit.
- **Pitch angle:** "AgentBond's CrossChainBot routes 58-chain swaps via LI.FI as a slashable, accountable service. The first cross-chain bridge with on-chain economic guarantees."
- **Where to look:** `bots/crosschain-bot.ts`

### ✅ Build with LI.FI: Superteam Germany ($2,500 USDC)
- Same submission as above, regional variant. Worth checking eligibility — some regional LI.FI tracks accept global submissions.

### ✅ Build with KIRAPAY ($1,505 USDC)
- **Why eligible:** Add KIRAPAY as one of the supported reward currencies (alongside SOL and USDR/Reflect). Small lift — `~30 min` of UI work.
- **Pitch angle:** "Pay agents in KIRAPAY for users who already use the wallet. Native settlement, no bridge."

---

## Tier 2 — STRONG FIT (small additions unlock these, ~7 tracks, ~$30K combined)

These need a 30–60 min frontend or doc addition to qualify. High ROI.

### ✅ Build with Torque MCP ($3,000 USDC)
- **Why eligible:** You already have an MCP server (`@agentbond/mcp-server`). Torque MCP is Solana's first-party MCP server — your MCP server can call Torque's tools too.
- **Action:** Add a short docs section showing AgentBond MCP + Torque MCP composability. ~20 min.

### ✅ Adevar Labs Security Audit ($50,000 in audit credits — non-cash but enormous value)
- **Why eligible:** Open to all serious projects on Solana. AgentBond is a smart contract handling escrowed funds — security review is genuinely valuable.
- **Action:** Submit asking for a security audit credit. Worth the 10 min even if you only use part of it.

### ✅ Cloak — Real World Payment Solutions with Privacy ($5,010 USDC)
- **Why eligible:** AgentBond's Confidential Mode (Arcium MPC) is a privacy-preserving payment flow.
- **Action:** Submit highlighting the Arcium-encrypted job descriptions feature.

### ✅ MagicBlock Privacy Track ($5,000 USDC)
- **Why eligible:** Privacy fit (Arcium for confidential agent jobs).
- **Action:** Submit with the same privacy angle as Cloak.

### ✅ Umbra Privacy Side Track ($10,000 USDC)
- **Why eligible:** Add a one-paragraph "Confidential Mode (Arcium) → Umbra production path" doc. They want privacy-on-Solana. AgentBond demonstrates the use case.
- **Action:** Add a section to `README.md` or `docs/privacy.md` explaining how Umbra would replace/complement Arcium for production.

### ✅ Jupiter "Not Your Regular Bounty" (3,000 jupUSD ≈ $3,000)
- **Why eligible:** Your `SwapBot` integrates Jupiter V6.
- **Action:** Submit highlighting that AgentBond is the trust layer for Jupiter-routed swaps. Stake-backed accountability for swap execution.

### ✅ Build an Autonomous Onchain Agent using Zerion CLI ($2,000 USDC)
- **Why eligible:** Your `PortfolioBot` already uses Zerion's API. Pivoting to Zerion CLI is a small change.
- **Action:** Update `bots/portfolio-bot.ts` to use Zerion CLI commands instead of raw API. ~30 min.

### ✅ Build a Autonomous Onchain Agent using Zerion CLI — second listing ($5,000 USDC)
- Same submission targets a different Zerion bounty. Submit to both.

---

## Tier 3 — POSSIBLE (more work, lower probability)

Only pursue if you have time after Tier 1 + Tier 2.

### 🟡 Encrypt & Ika — Bridgeless Capital Markets ($15,000 USDC)
- **Fit:** AgentBond cross-chain via LI.FI + capital escrow primitive.
- **Lift:** Significant — they want bridgeless capital markets specifically. Borderline fit.

### 🟡 Tether Frontier Hackathon Track (10,000 USDT)
- **Fit:** Add USDT as another reward currency option.
- **Lift:** ~30 min UI work + write submission.

### 🟡 Palm USD × Superteam UAE — Global Track (10,000 PUSD)
- **Fit:** Stablecoin track, accepts global submissions. Add Palm USD as another reward option.
- **Lift:** Same as Tether (~30 min).

### 🟡 Visa Frontier Track (10,000 USDG)
- **Fit:** Probably card/payment focused. AgentBond + MoonPay onramp could fit.
- **Lift:** Submit highlighting MoonPay credit-card → SOL → agent stake flow.

### 🟡 Dune Analytics Data Sidetrack ($6,000 USDC, 6k Plan)
- **Fit:** Build a Dune dashboard tracking AgentBond on-chain metrics (jobs, slashes, agents).
- **Lift:** ~2 hours to build a real dashboard. High signal, slow ROI.

### 🟡 Build with GoldRush (Covalent) ($3,000 USDC)
- **Fit:** Use Covalent for agent transaction history.
- **Lift:** Replace some Helius webhook work with Covalent. ~1 hour.

### 🟡 SagaPad — Build Agentic Skills helping Colosseum projects win on X ($1,000 USDC)
- **Fit:** Submit your elizaOS plugin or MCP server as the "agentic skill."
- **Lift:** Just write the submission. ~10 min. Easy money.

---

## Tier 4 — NOT ELIGIBLE (skip)

Regional tracks restricted to that country's residents:

| Track | Region | Prize |
|---|---|---|
| Superteam Turkey × Halborn | Turkey | 10,000 USDG |
| Superteam Japan | Japan | 10,000 USDG |
| Superteam Georgia | Georgia | 10,000 USDG |
| Superteam Ukraine | Ukraine | 10,000 USDG |
| SuperteamNG × Raenest | Nigeria | 10,000 USDG |
| Superteam Canada (IGWM) | Canada | 10,000 USDG |
| Superteam Balkan × SEE ICT | Balkans | 10,000 USDG |
| Superteam Malaysia × AppWorks | Malaysia | $10,000 USDC |
| Superteam Brasil | Brazil | 10,000 USDG |
| Superteam Indonesia (Campus) | Indonesia | 10,000 USDG |
| Superteam Singapore | Singapore | 10,000 USDG |
| Superteam Nepal | Nepal | 10,000 USDG |
| Superteam Ireland | Ireland | 10,000 USDG |
| Seoulana × Rocketpunch | South Korea | 10,000 USDG |
| Superteam Poland × Eleven Labs | Poland | 10,000 USDG |
| Superteam UAE × NeosLegal | UAE | 10,000 USDG |
| Superteam Australia | Australia | 8,000 USDG |
| Superteam NL × AISO | Netherlands | 8,000 USDG |
| Superteam Pakistan × KAST | Pakistan | $5,000 USDC |
| Superteam Kazakhstan | Kazakhstan | 4,000 USDG |
| Superteam KZ × S1lkPay | Kazakhstan | 3,000 USDG |
| Superteam KZ & METAFORRA | Kazakhstan | 3,000 USDG |
| Side Track Superteam Brasil | Brazil | 10,000 USDG |
| Side Track Superteam Kazakhstan | Kazakhstan | 4,000 USDG |
| Frontier Hackathon (Singapore Track) | Singapore | 10,000 USDG |
| Solana Network State Spring (Superteam MY × AppWorks) | Malaysia | $10,000 USDC |
| Frontier Hackathon (Ukrainian Track) | Ukraine | 10,000 USDG |

---

## Combined Realistic Prize Stack (Tier 1 + Tier 2 + Main)

| Source | Amount | Probability |
|---|---|---|
| Main: University Award | $10,000 | High (verified Indian undergrad with IEEE paper) |
| Main: Public Goods Award | $10,000 | High (open-source protocol primitive) |
| Main: 20 Standout Teams | $10,000 each ($200K pool) | Medium |
| Main: Grand Champion | $30,000 | Low but possible |
| Main: Accelerator interview | $250K pre-seed | Stretch but real |
| Side: Superteam India × Dodo | $10,000 | High |
| Side: 100xDevs | $10,000 | Medium-High |
| Side: SNS Identity | $5,000 | High (already integrated) |
| Side: LI.FI Balkan | $2,500 | Medium |
| Side: LI.FI Germany | $2,500 | Medium |
| Side: KIRAPAY | $1,505 | Medium-High (small field) |
| Side: Torque MCP | $3,000 | Medium |
| Side: Adevar Labs Audit | $50,000 credits | Medium (large field but you have a real contract) |
| Side: Cloak Privacy | $5,010 | Medium |
| Side: MagicBlock Privacy | $5,000 | Medium |
| Side: Umbra Privacy | $10,000 | Medium |
| Side: Jupiter | $3,000 | Medium-High |
| Side: Zerion CLI ($2k + $5k) | $7,000 | Medium |

**Tier 1 + Tier 2 conservative estimate: $40,000+ in cash + $50,000 in audit credits**

If you hit just 30% of these you're at $15K+ in cash from side tracks alone, on top of any main-track winnings.

---

## Submission Checklist (per track)

For each Tier 1/Tier 2 track you submit to:

1. ☐ Click "Submit" on the listing
2. ☐ Project name: `AgentBond`
3. ☐ One-line tagline: `AI agents stake SOL before taking jobs. Failure triggers automatic on-chain slashing.`
4. ☐ GitHub: `https://github.com/DiveshK007/agentbond`
5. ☐ Demo video URL (your YouTube unlisted link)
6. ☐ Live URL (Vercel deploy or "Local: bash scripts/start-all.sh")
7. ☐ Customize the description to mention the specific sponsor's tech in 1–2 sentences
8. ☐ Slashing TX URL (for proof of working slashing)
9. ☐ Submit

**Estimated time per submission: 5–10 min once you have your assets ready.**

---

## What to do NOW

1. Re-use your assets across all submissions (video, writeup, GitHub link)
2. Apply to all 6 Tier 1 tracks first — that's 60 min of work for ~$32K in prize exposure
3. Add the 30-min frontend additions for Tier 2 tracks (Zerion CLI swap, KIRAPAY/Tether/Palm USD currency options)
4. Apply to Tier 2 tracks
5. **Then** record the demo video and submit to the main Colosseum form
