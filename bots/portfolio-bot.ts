import "dotenv/config";
import fetch from "node-fetch";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";

const SOL = 1_000_000_000n;

const ZERION_API_BASE = "https://api.zerion.io/v1";

/**
 * PortfolioBot — fetches cross-chain portfolio data via the Zerion API.
 *
 * Job description expected format (via metadata API):
 * {
 *   "action": "portfolio_summary",
 *   "walletAddress": "0x... or base58 Solana address"
 * }
 *
 * Falls back to the bot's own wallet address if metadata isn't available.
 */
class PortfolioBot extends BaseBot {
  constructor() {
    super("PortfolioBot", "portfolio_summary", SOL / 2n, 25_000n, "portfolio");
  }

  async executeJob(job: Job): Promise<string> {
    let walletAddress = this.walletPublicKey.toBase58();

    // Try to parse target wallet from job metadata
    try {
      const API_BASE = process.env.API_URL || "http://localhost:3001";
      const descHash = Buffer.from(job.descriptionHash).toString("hex");
      const metaRes = await fetch(`${API_BASE}/api/metadata/job/${descHash}`);
      if (metaRes.ok) {
        const meta = (await metaRes.json()) as { walletAddress?: string };
        if (meta.walletAddress) {
          walletAddress = meta.walletAddress;
        }
      }
    } catch {
      this.log("Could not fetch job metadata, using bot's own wallet");
    }

    this.log(`Fetching portfolio for wallet: ${walletAddress}`);

    const apiKey = process.env.ZERION_API_KEY;

    // Fetch portfolio positions from Zerion
    const headers: Record<string, string> = {
      accept: "application/json",
    };

    if (apiKey) {
      headers.authorization = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
    }

    const positionsUrl = `${ZERION_API_BASE}/wallets/${walletAddress}/positions/?filter[positions]=no_filter&currency=usd&sort=value`;

    const res = await fetch(positionsUrl, { headers });

    if (!res.ok) {
      // If Zerion API fails (no key, rate limited, etc.), return a demo summary
      this.log(`Zerion API returned ${res.status}, generating demo summary`);
      return this.generateDemoSummary(walletAddress);
    }

    const data = (await res.json()) as ZerionResponse;

    // Aggregate portfolio data
    let totalValue = 0;
    const tokens: TokenPosition[] = [];

    for (const position of data.data ?? []) {
      const attrs = position.attributes;
      const value = attrs?.value ?? 0;
      totalValue += value;

      tokens.push({
        name: attrs?.fungible_info?.name ?? "Unknown",
        symbol: attrs?.fungible_info?.symbol ?? "???",
        quantity: attrs?.quantity?.float ?? 0,
        value,
        chain: attrs?.position_type ?? "wallet",
      });
    }

    // Sort by value descending
    tokens.sort((a, b) => b.value - a.value);

    const result = {
      action: "portfolio_summary",
      walletAddress,
      totalValueUsd: Math.round(totalValue * 100) / 100,
      positionCount: tokens.length,
      topPositions: tokens.slice(0, 10),
      timestamp: Date.now(),
      source: "zerion_v1",
    };

    this.log(
      `Portfolio fetched: $${result.totalValueUsd} across ${result.positionCount} positions`
    );

    return JSON.stringify(result);
  }

  private generateDemoSummary(walletAddress: string): string {
    return JSON.stringify({
      action: "portfolio_summary",
      walletAddress,
      totalValueUsd: 0,
      positionCount: 0,
      topPositions: [],
      timestamp: Date.now(),
      source: "zerion_v1_demo",
      note: "Zerion API key not configured or wallet has no positions. Set ZERION_API_KEY in .env for live data.",
    });
  }
}

interface TokenPosition {
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  chain: string;
}

interface ZerionResponse {
  data?: Array<{
    attributes?: {
      value?: number;
      quantity?: { float?: number };
      fungible_info?: { name?: string; symbol?: string };
      position_type?: string;
    };
  }>;
}

new PortfolioBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
