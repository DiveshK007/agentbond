import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import { client } from "../connection";

const router = Router();

/**
 * GET /api/agents
 * Returns all registered agents sorted by reputation.
 * Supports optional pagination via ?page=&limit= query params.
 * Without pagination params returns full list for backward compat.
 */
router.get("/", async (req, res) => {
  try {
    const agents = await client.getAllAgents();
    agents.sort((a, b) => b.reputation - a.reputation);

    const pageParam = req.query["page"];
    if (pageParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
      const total = agents.length;
      const start = (page - 1) * limit;
      return res.json({
        agents: agents.slice(start, start + limit),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    return res.json(agents);
  } catch (err) {
    console.error("[agents] GET /", err);
    return res.status(500).json({ error: "Failed to fetch agents" });
  }
});

/**
 * GET /api/agents/:pubkey
 * Returns a single agent profile by owner public key.
 */
router.get("/:pubkey", async (req, res) => {
  try {
    const agent = await client.getAgent(new PublicKey(req.params["pubkey"]));
    return res.json(agent);
  } catch (err) {
    console.error("[agents] GET /:pubkey", err);
    return res.status(404).json({ error: "Agent not found" });
  }
});

export default router;
