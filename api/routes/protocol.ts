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
      (sum, a) => sum + Number(a.stake || 0) / 1e9,
      0
    );
    const solSlashed = agents.reduce(
      (sum, a) => sum + Number(a.totalSlashed || 0) / 1e9,
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
    res.status(500).json({ error: String(err) });
  }
});

export default router;
