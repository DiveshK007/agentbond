import "dotenv/config";
import { BaseBot } from "./base-bot";
import type { Job } from "../sdk/src/types";

const SOL = 1_000_000_000n;

class SwapBot extends BaseBot {
  constructor() {
    super("SwapBot", "execute_swap", SOL, 50_000n);
  }

  async executeJob(_job: Job): Promise<string> {
    return JSON.stringify({
      fromToken: "SOL",
      toToken: "USDC",
      amountIn: 0.01,
      amountOut: 0.95,
      txSignature: `simulated_${Date.now()}`,
    });
  }
}

new SwapBot().start().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
