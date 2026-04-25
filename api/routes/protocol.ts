import { Router } from "express";
import { client } from "../connection";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const stats = await client.getProtocolStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
