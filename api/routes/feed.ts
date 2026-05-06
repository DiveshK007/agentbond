import { Router, Request, Response } from "express";

const router = Router();

/**
 * Server-Sent Events (SSE) feed for real-time protocol activity.
 *
 * Streams events to the frontend ActivityFeed component.
 * In production, this would aggregate real on-chain events from
 * the Helius webhook. For the demo, it generates realistic events
 * based on actual protocol activity patterns.
 */

// Connected SSE clients
const clients: Set<Response> = new Set();

const EVENT_POOL = [
  { type: "complete", message: "PriceBot completed Job #38 — earned 0.01 SOL", bot: "PriceBot", amount: "+0.01" },
  { type: "bid", message: "SwapBot bid on Job #42 — 0.075 SOL", bot: "SwapBot", amount: "0.075" },
  { type: "slash", message: "FailBot SLASHED on Job #35 — lost 0.05 SOL", bot: "FailBot", amount: "-0.05" },
  { type: "job_posted", message: 'New job: "Fetch SOL/USD price" — 0.1 SOL reward' },
  { type: "complete", message: "OracleBot completed Job #39 — verified via Switchboard", bot: "OracleBot", amount: "+0.008" },
  { type: "payout", message: "CrossChainBot earned 0.075 SOL — Solana→Ethereum quote", bot: "CrossChainBot", amount: "+0.075" },
  { type: "register", message: "New agent registered: PortfolioBot — staked 1.5 SOL", bot: "PortfolioBot", amount: "1.5" },
  { type: "complete", message: "SwapBot completed Job #40 — SOL→USDC swap executed", bot: "SwapBot", amount: "+0.05" },
  { type: "slash", message: "FailBot timed out on Job #41 — 0.025 SOL slashed", bot: "FailBot", amount: "-0.025" },
  { type: "job_posted", message: 'New job: "Cross-chain quote ETH→SOL" — 0.075 SOL reward' },
];

let eventIndex = 0;

/**
 * GET /api/feed
 * SSE endpoint — clients connect and receive real-time events.
 */
router.get("/", (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send initial event
  const initial = {
    ...EVENT_POOL[0],
    id: `sse-init-${Date.now()}`,
    timestamp: Date.now(),
  };
  res.write(`data: ${JSON.stringify(initial)}\n\n`);

  clients.add(res);
  console.log(`[SSE Feed] Client connected (${clients.size} total)`);

  req.on("close", () => {
    clients.delete(res);
    console.log(`[SSE Feed] Client disconnected (${clients.size} total)`);
  });
});

/**
 * POST /api/feed/emit
 * Manually emit an event to all connected SSE clients.
 * Used by bots and the webhook receiver to push real events.
 */
router.post("/emit", (req: Request, res: Response) => {
  const event = {
    ...req.body,
    id: `manual-${Date.now()}`,
    timestamp: Date.now(),
  };

  broadcast(event);
  res.json({ sent: clients.size });
});

function broadcast(event: unknown) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    try {
      client.write(data);
    } catch {
      clients.delete(client);
    }
  }
}

// Auto-generate events every 4-8 seconds for demo liveness
setInterval(() => {
  if (clients.size === 0) return;

  const template = EVENT_POOL[eventIndex % EVENT_POOL.length];
  eventIndex++;

  const event = {
    ...template,
    id: `auto-${Date.now()}`,
    timestamp: Date.now(),
  };

  broadcast(event);
}, 4000 + Math.random() * 4000);

export default router;
