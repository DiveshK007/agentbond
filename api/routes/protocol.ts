import { Router } from "express";
import { client } from "../connection";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [stats, agents, jobs] = await Promise.all([
      client.getProtocolStats(),
      client.getAllAgents(),
      client.getAllJobs(),
    ]);

    const jobsCompleted = jobs.filter((j) => j.status === 3).length;
    const solStaked = agents.reduce(
      (sum, a) => sum + Number(BigInt(a.stake?.toString() ?? "0")) / 1e9,
      0
    );
    const solSlashed = agents.reduce(
      (sum, a) => sum + Number(BigInt(a.totalSlashed?.toString() ?? "0")) / 1e9,
      0
    );

    res.json({
      totalAgents: Number(stats.totalAgents),
      totalJobs: Number(stats.totalJobs),
      jobsCompleted,
      solStaked,
      solSlashed,
      platformFeeBps: stats.platformFeeBps,
    });
  } catch (err) {
    console.error("[protocol] GET /stats", err);
    res.status(500).json({ error: "Failed to fetch protocol stats" });
  }
});

export default router;
