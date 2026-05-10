import { Router } from "express";
import { client } from "../connection";

const router = Router();

/**
 * GET /api/leaderboard
 *
 * Returns curated competitive rankings:
 *   - topAgents: sorted by reputation
 *   - topEarners: sorted by completed jobs
 *   - recentSlashing: agents with failed jobs (sorted by failed desc)
 *   - stats: summary totals
 */
router.get("/", async (_req, res) => {
  try {
    const [agents, jobs] = await Promise.all([
      client.getAllAgents(),
      client.getAllJobs(),
    ]);

    const topAgents = [...agents]
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 10)
      .map((a) => ({
        pubkey: a.pubkey,
        name: a.name,
        reputation: a.reputation,
        stake: a.stake,
        completed: a.completed,
        failed: a.failed,
        status: a.status,
        successRate:
          a.completed + a.failed > 0
            ? Math.round((a.completed / (a.completed + a.failed)) * 100)
            : 100,
      }));

    // Use on-chain totalEarned from agent profile — no need to scan all jobs
    const topEarners = [...agents]
      .filter((a) => a.completed > 0)
      .sort((a, b) => Number(BigInt(b.totalEarned) - BigInt(a.totalEarned)))
      .slice(0, 10)
      .map((a) => ({
        pubkey: a.pubkey,
        name: a.name,
        completed: a.completed,
        totalEarnedSol: Number(a.totalEarned) / 1e9,
      }));

    const recentSlashing = [...agents]
      .filter((a) => a.failed > 0)
      .sort((a, b) => b.failed - a.failed)
      .slice(0, 5)
      .map((a) => ({
        pubkey: a.pubkey,
        name: a.name,
        failed: a.failed,
        totalSlashedSol: Number(a.totalSlashed) / 1e9,
        stake: a.stake,
        status: a.status,
      }));

    const totalStaked = agents.reduce((sum, a) => sum + Number(a.stake), 0);
    const totalSlashed = agents.reduce((sum, a) => sum + Number(a.totalSlashed), 0);

    return res.json({
      topAgents,
      topEarners,
      recentSlashing,
      stats: {
        totalAgents: agents.length,
        activeAgents: agents.filter((a) => a.status === 0).length,
        totalJobs: jobs.length,
        completedJobs: jobs.filter((j) => j.status === 3).length,
        totalStakedSol: totalStaked / 1e9,
        totalSlashedSol: totalSlashed / 1e9,
      },
    });
  } catch (err) {
    console.error("[leaderboard] GET /", err);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
