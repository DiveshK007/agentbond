import { Router, Request, Response } from "express";

const router = Router();

/**
 * Helius-powered agent transaction monitoring.
 *
 * Provides two capabilities:
 * 1. Webhook receiver — Helius pushes parsed transaction data here
 * 2. Transaction history — Fetches enhanced transaction history for agent profiles
 *
 * Setup: Set HELIUS_API_KEY in .env, then call POST /api/webhooks/register
 * to create a webhook monitoring the AgentBond program.
 */

const HELIUS_API_KEY = process.env.HELIUS_API_KEY ?? "";
const HELIUS_API_BASE = "https://api.helius.xyz/v0";
const PROGRAM_ID = "5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3";

// In-memory event log (last 500 events)
const eventLog: ParsedEvent[] = [];
const MAX_EVENTS = 500;

interface ParsedEvent {
  signature: string;
  type: string;
  description: string;
  timestamp: number;
  accounts: string[];
  fee: number;
  slot: number;
}

/**
 * POST /api/webhooks/helius
 * Webhook receiver endpoint — Helius pushes parsed transactions here.
 * Register this URL as your webhook callback in the Helius dashboard
 * or via the /register endpoint below.
 */
router.post("/helius", (req: Request, res: Response) => {
  const events = req.body as HeliusWebhookPayload[];

  if (!Array.isArray(events)) {
    res.status(400).json({ error: "Expected array of events" });
    return;
  }

  for (const event of events) {
    const parsed: ParsedEvent = {
      signature: event.signature ?? "unknown",
      type: event.type ?? "UNKNOWN",
      description: event.description ?? "",
      timestamp: event.timestamp ?? Date.now() / 1000,
      accounts: event.accountData?.map((a) => a.account) ?? [],
      fee: event.fee ?? 0,
      slot: event.slot ?? 0,
    };

    eventLog.unshift(parsed);
    if (eventLog.length > MAX_EVENTS) {
      eventLog.pop();
    }

    console.log(
      `[Helius Webhook] ${parsed.type}: ${parsed.description} (tx: ${parsed.signature.slice(0, 12)}…)`
    );
  }

  res.json({ received: events.length });
});

/**
 * GET /api/webhooks/events
 * Returns the most recent parsed events from the webhook.
 * Query params: ?limit=50&type=TRANSFER
 */
router.get("/events", (_req: Request, res: Response) => {
  const limit = Math.min(parseInt(_req.query.limit as string) || 50, MAX_EVENTS);
  const typeFilter = _req.query.type as string | undefined;

  let filtered = eventLog;
  if (typeFilter) {
    filtered = eventLog.filter((e) => e.type === typeFilter);
  }

  res.json({
    total: filtered.length,
    events: filtered.slice(0, limit),
  });
});

/**
 * GET /api/webhooks/transactions/:address
 * Fetch enhanced (parsed) transaction history for a Solana address
 * using the Helius Enhanced Transactions API.
 */
router.get("/transactions/:address", async (req: Request, res: Response) => {
  if (!HELIUS_API_KEY) {
    return res.status(503).json({
      error: "HELIUS_API_KEY not configured",
      note: "Set HELIUS_API_KEY in .env for transaction history",
    });
  }

  const address = req.params.address;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  try {
    const url = `${HELIUS_API_BASE}/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Helius API error: ${response.status}`,
      });
    }

    const transactions = (await response.json()) as EnhancedTransaction[];

    // Parse into a clean format for the frontend
    const parsed = transactions.map((tx) => ({
      signature: tx.signature,
      type: tx.type,
      description: tx.description,
      timestamp: tx.timestamp,
      fee: tx.fee,
      feePayer: tx.feePayer,
      slot: tx.slot,
      nativeTransfers: tx.nativeTransfers ?? [],
      tokenTransfers: tx.tokenTransfers ?? [],
      source: "helius",
    }));

    return res.json({
      address,
      transactions: parsed,
      count: parsed.length,
      source: "helius_enhanced",
    });
  } catch (err) {
    console.error("[webhooks] GET /transactions/:address", err);
    return res.status(500).json({ error: "Failed to fetch transaction history" });
  }
});

/**
 * POST /api/webhooks/register
 * Programmatically create a Helius webhook to monitor the AgentBond program.
 * Requires HELIUS_API_KEY and a publicly accessible callback URL.
 */
router.post("/register", async (req: Request, res: Response) => {
  if (!HELIUS_API_KEY) {
    return res.status(503).json({ error: "HELIUS_API_KEY not configured" });
  }

  const { callbackUrl } = req.body as { callbackUrl?: string };
  if (!callbackUrl) {
    return res.status(400).json({ error: "callbackUrl required" });
  }

  try {
    const response = await fetch(
      `${HELIUS_API_BASE}/webhooks?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookURL: callbackUrl,
          transactionTypes: ["Any"],
          accountAddresses: [PROGRAM_ID],
          webhookType: "enhanced",
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Helius webhook creation failed: ${errText}`,
      });
    }

    const result = await response.json();
    return res.json({
      success: true,
      webhook: result,
      monitoring: PROGRAM_ID,
    });
  } catch (err) {
    console.error("[webhooks] POST /register", err);
    return res.status(500).json({ error: "Failed to register webhook" });
  }
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeliusWebhookPayload {
  signature?: string;
  type?: string;
  description?: string;
  timestamp?: number;
  fee?: number;
  slot?: number;
  accountData?: Array<{ account: string }>;
}

interface EnhancedTransaction {
  signature: string;
  type: string;
  description: string;
  timestamp: number;
  fee: number;
  feePayer: string;
  slot: number;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
}

export default router;
