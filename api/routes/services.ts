import { Router } from "express";
import { paymentMiddleware } from "x402-express";

const router = Router();

/**
 * The facilitator verifies and settles x402 payments.
 * Coinbase provides a hosted facilitator for free (1000 tx/month).
 */
const FACILITATOR_URL = "https://x402.org/facilitator";

/**
 * The wallet address that receives payments for agent services.
 * Set via environment variable or defaults to a demo address.
 */
const PAYMENT_RECEIVER =
  process.env.X402_RECEIVER_ADDRESS ?? "DEMO_RECEIVER_ADDRESS";

/**
 * x402-protected agent service endpoints.
 *
 * These endpoints require callers to pay USDC per request.
 * AI agents and humans can both call these — no API keys needed.
 *
 * Flow:
 * 1. Client calls GET /api/services/price → gets 402 with payment instructions
 * 2. Client constructs USDC payment and retries with PAYMENT-SIGNATURE header
 * 3. x402 middleware verifies payment via facilitator
 * 4. If valid, the request proceeds and the agent executes the job
 */

// Price check service — $0.001 per request
router.get(
  "/price",
  paymentMiddleware(FACILITATOR_URL, PAYMENT_RECEIVER, {
    amountUsd: 0.001,
    description: "SOL/USD price feed — real-time Coinbase data",
    mimeType: "application/json",
    maxDeadlineSeconds: 60,
    resource: "/api/services/price",
    outputSchema: {
      price: "number",
      timestamp: "number",
      source: "string",
    },
  }),
  async (_req, res) => {
    try {
      const response = await fetch(
        "https://api.coinbase.com/v2/prices/SOL-USD/spot"
      );
      if (!response.ok) {
        return res.status(502).json({ error: "Upstream price feed error" });
      }
      const data = (await response.json()) as {
        data: { amount: string };
      };
      return res.json({
        price: parseFloat(data.data.amount),
        timestamp: Date.now(),
        source: "coinbase",
        paidVia: "x402",
      });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }
);

// Portfolio summary service — $0.005 per request
router.get(
  "/portfolio/:wallet",
  paymentMiddleware(FACILITATOR_URL, PAYMENT_RECEIVER, {
    amountUsd: 0.005,
    description:
      "Portfolio summary — aggregated cross-chain holdings via Zerion",
    mimeType: "application/json",
    maxDeadlineSeconds: 30,
    resource: "/api/services/portfolio/:wallet",
    outputSchema: {
      walletAddress: "string",
      totalValueUsd: "number",
      positionCount: "number",
    },
  }),
  async (req, res) => {
    const wallet = req.params.wallet;
    const apiKey = process.env.ZERION_API_KEY;

    const headers: Record<string, string> = {
      accept: "application/json",
    };
    if (apiKey) {
      headers.authorization = `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
    }

    try {
      const positionsUrl = `https://api.zerion.io/v1/wallets/${wallet}/positions/?filter[positions]=no_filter&currency=usd&sort=value`;
      const zerionRes = await fetch(positionsUrl, { headers });

      if (!zerionRes.ok) {
        return res.json({
          walletAddress: wallet,
          totalValueUsd: 0,
          positionCount: 0,
          topPositions: [],
          note: zerionRes.status === 401
            ? "Set ZERION_API_KEY in .env for live portfolio data"
            : `Zerion returned ${zerionRes.status}`,
          paidVia: "x402",
          timestamp: Date.now(),
        });
      }

      const data = (await zerionRes.json()) as {
        data?: Array<{
          attributes?: {
            value?: number;
            quantity?: { float?: number };
            fungible_info?: { name?: string; symbol?: string };
            position_type?: string;
          };
        }>;
      };

      let totalValue = 0;
      const tokens: Array<{
        name: string;
        symbol: string;
        quantity: number;
        value: number;
        chain: string;
      }> = [];

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

      return res.json({
        walletAddress: wallet,
        totalValueUsd: Math.round(totalValue * 100) / 100,
        positionCount: tokens.length,
        topPositions: tokens.slice(0, 10),
        paidVia: "x402",
        timestamp: Date.now(),
        source: "zerion_v1",
      });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }
);

// Swap quote service — $0.002 per request
router.get(
  "/swap-quote",
  paymentMiddleware(FACILITATOR_URL, PAYMENT_RECEIVER, {
    amountUsd: 0.002,
    description: "Jupiter swap quote — best route for token swap on Solana",
    mimeType: "application/json",
    maxDeadlineSeconds: 30,
    resource: "/api/services/swap-quote",
    outputSchema: {
      inputMint: "string",
      outputMint: "string",
      inAmount: "string",
      outAmount: "string",
      routePlan: "array",
    },
  }),
  async (req, res) => {
    const inputMint =
      (req.query.inputMint as string) ??
      "So11111111111111111111111111111111111111112";
    const outputMint =
      (req.query.outputMint as string) ??
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
    const amount = (req.query.amount as string) ?? "10000000";

    try {
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(502).json({ error: "Jupiter API error" });
      }
      const quote = await response.json();
      return res.json({ ...quote, paidVia: "x402" });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }
);

export default router;
