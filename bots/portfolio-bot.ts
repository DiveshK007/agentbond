import "dotenv/config";
import { spawn } from "child_process";
import fetch from "node-fetch";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";

const SOL = 1_000_000_000n;

/**
 * PortfolioBot — autonomous on-chain agent that fetches cross-chain portfolio
 * data using the Zerion CLI (https://github.com/zeriontech/zerion-cli).
 *
 * Falls back to the Zerion REST API if the CLI is not installed locally —
 * this keeps the bot operable on machines without the CLI while still
 * preferring the CLI path when available (and demonstrating the integration
 * path the Zerion CLI Frontier track is asking for).
 *
 * Job description expected format (via metadata API):
 * {
 *   "action": "portfolio_summary",
 *   "walletAddress": "0x... or base58 Solana address"
 * }
 */
class PortfolioBot extends BaseBot {
  constructor() {
    super("PortfolioBot", "portfolio_summary", SOL / 2n, 25_000n, "portfolio");
  }

  async executeJob(job: Job): Promise<string> {
    let walletAddress = this.walletPublicKey.toBase58();

    // Resolve target wallet from job metadata
    try {
      const apiBase = process.env["API_URL"] || "http://localhost:3001";
      const descHash = Buffer.from(job.descriptionHash).toString("hex");
      const metaRes = await fetch(`${apiBase}/api/metadata/job/${descHash}`);
      if (metaRes.ok) {
        const meta = (await metaRes.json()) as { walletAddress?: string };
        if (meta.walletAddress) walletAddress = meta.walletAddress;
      }
    } catch {
      this.log("Could not fetch job metadata, using bot's own wallet");
    }

    this.log(`Fetching portfolio for wallet: ${walletAddress}`);

    // Try Zerion CLI first; fall back to REST API
    const cliResult = await this.tryZerionCli(walletAddress);
    if (cliResult) return cliResult;

    return await this.zerionRestFallback(walletAddress);
  }

  /**
   * Invoke `npx zerion portfolio <address>` and parse JSON output.
   * Returns null if the CLI is not installed or fails — caller falls back.
   */
  private async tryZerionCli(walletAddress: string): Promise<string | null> {
    try {
      const stdout = await this.runCommand("npx", [
        "-y",
        "zerion-cli",
        "portfolio",
        walletAddress,
        "--json",
      ]);

      if (!stdout) return null;
      const parsed = JSON.parse(stdout) as ZerionCliOutput;

      const result = {
        action: "portfolio_summary",
        walletAddress,
        totalValueUsd: parsed.total_value_usd ?? 0,
        positionCount: parsed.positions?.length ?? 0,
        topPositions: (parsed.positions ?? []).slice(0, 10),
        timestamp: Date.now(),
        source: "zerion_cli",
      };

      this.log(
        `[Zerion CLI] $${result.totalValueUsd.toFixed(2)} across ${result.positionCount} positions`
      );

      return JSON.stringify(result);
    } catch (err) {
      this.log(
        `Zerion CLI unavailable (${err instanceof Error ? err.message : String(err)}); falling back to REST`
      );
      return null;
    }
  }

  /**
   * Run a subprocess and resolve with stdout. Times out after 20s.
   */
  private runCommand(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("Zerion CLI timed out after 20s"));
      }, 20_000);

      child.stdout.on("data", (chunk: Buffer) => {
        stdout += chunk.toString("utf8");
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString("utf8");
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`exit ${code}: ${stderr.trim()}`));
        }
      });

      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  /**
   * Direct REST API call — used when the Zerion CLI isn't installed.
   */
  private async zerionRestFallback(walletAddress: string): Promise<string> {
    const apiKey = process.env["ZERION_API_KEY"];
    const headers: Record<string, string> = { accept: "application/json" };
    if (apiKey) {
      headers.authorization = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
    }

    const url = `https://api.zerion.io/v1/wallets/${walletAddress}/positions/?filter[positions]=no_filter&currency=usd&sort=value`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      this.log(`Zerion REST returned ${res.status}, returning demo summary`);
      return JSON.stringify({
        action: "portfolio_summary",
        walletAddress,
        totalValueUsd: 0,
        positionCount: 0,
        topPositions: [],
        timestamp: Date.now(),
        source: "zerion_rest_demo",
        note: "Zerion CLI not installed and REST API key missing/invalid. Install: npm i -g zerion-cli",
      });
    }

    const data = (await res.json()) as ZerionRestResponse;
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

    tokens.sort((a, b) => b.value - a.value);

    const result = {
      action: "portfolio_summary",
      walletAddress,
      totalValueUsd: Math.round(totalValue * 100) / 100,
      positionCount: tokens.length,
      topPositions: tokens.slice(0, 10),
      timestamp: Date.now(),
      source: "zerion_rest_v1",
    };

    this.log(
      `[Zerion REST] $${result.totalValueUsd} across ${result.positionCount} positions`
    );

    return JSON.stringify(result);
  }
}

interface TokenPosition {
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  chain: string;
}

interface ZerionCliOutput {
  total_value_usd?: number;
  positions?: TokenPosition[];
}

interface ZerionRestResponse {
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
