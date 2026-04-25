import "dotenv/config";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";

const SOL = 1_000_000_000n;

class FailBot extends BaseBot {
  constructor() {
    super("FailBot", "fetch_sol_price", SOL / 10n, 5_000n);
  }

  async executeJob(_job: Job): Promise<string> {
    return JSON.stringify({
      error: "bot malfunctioned",
      data: `corrupted_${Math.random()}`,
    });
  }
}

new FailBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
