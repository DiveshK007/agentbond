import { Router } from "express";
import { Connection } from "@solana/web3.js";

const router = Router();

const rpcUrl = process.env["RPC_URL"] ?? "https://api.devnet.solana.com";

router.get("/", async (_req, res) => {
  let rpcStatus = "unknown";
  try {
    const conn = new Connection(rpcUrl, "confirmed");
    await conn.getSlot();
    rpcStatus = "connected";
  } catch {
    rpcStatus = "disconnected";
  }

  const status = rpcStatus === "connected" ? "ok" : "degraded";

  res.status(status === "ok" ? 200 : 503).json({
    status,
    rpc: rpcStatus,
    timestamp: Date.now(),
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
