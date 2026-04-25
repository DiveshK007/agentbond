import { Router } from "express";
import { client } from "../connection";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const statusParam = req.query["status"];
    const status =
      typeof statusParam === "string" ? parseInt(statusParam, 10) : undefined;
    const jobs = await client.getAllJobs(status);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/:index", async (req, res) => {
  try {
    const job = await client.getJob(BigInt(req.params["index"]));
    res.json(job);
  } catch (err) {
    res.status(404).json({ error: String(err) });
  }
});

export default router;
