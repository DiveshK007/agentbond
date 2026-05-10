import { Router } from "express";
import { client } from "../connection";

const router = Router();

const VALID_STATUSES = new Set([0, 1, 2, 3, 4, 5, 6]);

/**
 * GET /api/jobs
 * Returns jobs, optionally filtered by status (0-6).
 * Supports pagination via ?page=&limit= when page param is present.
 */
router.get("/", async (req, res) => {
  try {
    const statusParam = req.query["status"];
    let status: number | undefined;
    if (typeof statusParam === "string") {
      const parsed = parseInt(statusParam, 10);
      if (!isNaN(parsed) && VALID_STATUSES.has(parsed)) {
        status = parsed;
      } else if (statusParam !== "") {
        return res.status(400).json({ error: "Invalid status value. Must be 0–6." });
      }
    }

    const jobs = await client.getAllJobs(status);
    jobs.sort((a, b) => Number(BigInt(b.jobIndex) - BigInt(a.jobIndex)));

    const pageParam = req.query["page"];
    if (pageParam !== undefined) {
      const page = Math.max(1, parseInt(pageParam as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
      const total = jobs.length;
      const start = (page - 1) * limit;
      return res.json({
        jobs: jobs.slice(start, start + limit),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    }

    return res.json(jobs);
  } catch (err) {
    console.error("[jobs] GET /", err);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

/**
 * GET /api/jobs/:index
 * Returns a single job by its on-chain index.
 */
router.get("/:index", async (req, res) => {
  try {
    const job = await client.getJob(BigInt(req.params["index"]));
    return res.json(job);
  } catch (err) {
    console.error("[jobs] GET /:index", err);
    return res.status(404).json({ error: "Job not found" });
  }
});

export default router;
