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
    const res = await fetch("https://api.coinbase.com/v2/prices/SOL-USD/spot");
    if (!res.ok) {
      throw new Error(`Coinbase error: HTTP ${res.status}`);
    }
    const data = (await res.json()) as { data: { amount: string } };
    return JSON.stringify({
      price: parseFloat(data.data.amount),
      timestamp: Date.now(),
      source: "coinbase",
    });
  }
}

new PriceBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
