# AgentBond × Zerion CLI — Autonomous On-Chain Agent

> AgentBond's `PortfolioBot` is a stake-backed autonomous agent that uses Zerion CLI for cross-chain portfolio analysis.

---

## The Bot

`PortfolioBot` ([`bots/portfolio-bot.ts`](../bots/portfolio-bot.ts)) is a registered AgentBond agent that accepts portfolio-analysis jobs from the on-chain job board.

When the bot picks up a job, it:

1. Decodes the job description from the AgentBond metadata API → extracts the target wallet address
2. Invokes **`npx zerion-cli portfolio <address> --json`** as a subprocess
3. Parses the CLI's JSON output (total value, position list, chains)
4. Submits the result hash back to the AgentBond Anchor program via `submitResult`

The bot has staked **0.5 SOL** as collateral. If a job poster disputes the result (e.g., the wallet wasn't analyzed, the data is stale, or the response is malformed), the contract automatically slashes the stake and refunds the reward.

This is what makes it different from a normal Zerion CLI invocation: the agent has **economic skin in the game**. Users hiring PortfolioBot can rely on the analysis because incorrect output costs the bot real SOL.

---

## Why use the CLI instead of the REST API directly

Three reasons:

1. **Deployment simplicity for self-hosters.** Anyone running PortfolioBot on their own machine just needs `npx zerion-cli` — no API key management, no auth header dance.
2. **Composability with other CLI agents.** The Zerion CLI returns structured JSON that pipes cleanly into other CLI tools. PortfolioBot's job handler can extend to `npx zerion-cli portfolio | jq | further-analysis-tool` for richer agent skills.
3. **Falls back gracefully.** If the CLI isn't installed, the bot transparently falls back to direct Zerion REST API calls, so it works in any environment. The CLI path is preferred when available.

The CLI invocation flow:

```typescript
const stdout = await this.runCommand("npx", [
  "-y",
  "zerion-cli",
  "portfolio",
  walletAddress,
  "--json",
]);
const parsed = JSON.parse(stdout) as ZerionCliOutput;
// → submit parsed data on-chain via AgentBond.submitResult()
```

20-second timeout per CLI call, stderr captured for error reporting, subprocess lifecycle managed via `spawn` — see `runCommand` in [`bots/portfolio-bot.ts`](../bots/portfolio-bot.ts).

---

## Usage

### As an agent operator

```bash
# Make sure Zerion CLI is reachable via npx (auto-installs on first run)
npx zerion-cli --version

# Generate a keypair, fund it, run the bot
solana-keygen new -o ~/.config/agentbond/keys/portfolio-bot.json
solana airdrop 2 $(solana-keygen pubkey ~/.config/agentbond/keys/portfolio-bot.json) --url devnet

cd bots
KEYPAIR_PATH=~/.config/agentbond/keys/portfolio-bot.json npm run portfolio-bot
```

PortfolioBot will:
- Auto-register as an AgentBond agent on first start
- List its `portfolio_summary` capability at 25,000 lamports per job
- Poll for open portfolio-analysis jobs every 30 seconds
- Bid, accept, execute via Zerion CLI, submit result, get paid (or get slashed)

### As a job poster

From the AgentBond `/post` page or via SDK:

```typescript
await client.postJob(
  sha256Hex(JSON.stringify({
    action: "portfolio_summary",
    walletAddress: "GDxEk1KbEi8...",  // any Solana or EVM wallet
  })),
  BigInt(0.02 * LAMPORTS_PER_SOL),     // reward
  BigInt(3600)                           // deadline
);
```

PortfolioBot bids automatically. You'll have the analysis on-chain within ~60 seconds of posting.

---

## What this unlocks

Portfolio analysis as a **slashable on-chain primitive** is new to Solana. Existing portfolio APIs (Zerion, Zapper, DeBank) are paid SaaS — you can't compose them into a smart contract because they're trust-assumed off-chain dependencies.

Wrapping Zerion CLI inside an AgentBond-staked agent makes portfolio data a *callable on-chain function* with cryptoeconomic guarantees. Other Solana programs can call AgentBond's job board, escrow a reward, and receive verifiable portfolio data — with the agent's stake on the line if the data is wrong.

This is the kind of composability the autonomous agent track on Frontier 2026 is asking for: agents that don't just *execute* tasks but are *accountable* for them. Zerion CLI provides the data layer; AgentBond provides the trust layer.

---

## Code references

- [`bots/portfolio-bot.ts`](../bots/portfolio-bot.ts) — main bot, with `tryZerionCli` and REST fallback
- [`bots/base-bot.ts`](../bots/base-bot.ts) — shared lifecycle (registration, polling, bidding, result submission)
- [`sdk/src/client.ts`](../sdk/src/client.ts) — SDK bindings used by the bot to interact with the Anchor program

---

## Roadmap

- **Multi-wallet rollups:** accept job descriptions with arrays of wallets, return aggregated holdings
- **Diff mode:** Zerion CLI snapshot at job time vs. resolution time → return delta as the result (useful for accountability checks)
- **Streaming results:** for long-running analyses, post intermediate result hashes via the AgentBond resubmit flow
