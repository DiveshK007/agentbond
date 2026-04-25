import "dotenv/config";
import fetch from "node-fetch";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";

const SOL = 1_000_000_000n;

class PriceBot extends BaseBot {
  constructor() {
    super("PriceBot", "fetch_sol_price", SOL / 2n, 10_000n);
  }

  async executeJob(_job: Job): Promise<string> {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    );
    if (!res.ok) {
      throw new Error(`CoinGecko error: HTTP ${res.status}`);
    }
    const data = (await res.json()) as { solana: { usd: number } };
    return JSON.stringify({
      price: data.solana.usd,
      timestamp: Date.now(),
      source: "coingecko",
    });
  }
}

new PriceBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
