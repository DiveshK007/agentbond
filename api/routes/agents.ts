import { Router } from "express";
import { PublicKey } from "@solana/web3.js";
import { client } from "../connection";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const agents = await client.getAllAgents();
    agents.sort((a, b) => b.reputation - a.reputation);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/:pubkey", async (req, res) => {
  try {
    const agent = await client.getAgent(new PublicKey(req.params["pubkey"]));
    res.json(agent);
  } catch (err) {
    res.status(404).json({ error: String(err) });
  }
});

export default router;
