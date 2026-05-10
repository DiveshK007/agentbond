import { Router, Request, Response } from "express";
import { createHash } from "crypto";
import db from "../db";

const router = Router();

/**
 * SQLite-backed metadata store for job descriptions and results.
 * Replaces the previous file-based JSON approach — atomic writes,
 * concurrent-read safe, survives server restarts.
 */

router.post("/job", (req: Request, res: Response) => {
  const { description } = req.body as { description?: string };
  if (!description) {
    res.status(400).json({ error: "description required" });
    return;
  }
  const hash = createHash("sha256").update(description).digest("hex");
  db.prepare(
    "INSERT OR IGNORE INTO job_descriptions (hash, description) VALUES (?, ?)"
  ).run(hash, description);
  res.json({ hash });
});

router.get("/job/:hash", (req: Request, res: Response) => {
  const row = db
    .prepare("SELECT description FROM job_descriptions WHERE hash = ?")
    .get(req.params["hash"]) as { description: string } | undefined;

  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({ hash: req.params["hash"], description: row.description });
});

router.post("/result", (req: Request, res: Response) => {
  const { result, jobIndex } = req.body as {
    result?: string;
    jobIndex?: number;
  };
  if (!result) {
    res.status(400).json({ error: "result required" });
    return;
  }
  const hash = createHash("sha256").update(result).digest("hex");
  db.prepare(
    "INSERT OR IGNORE INTO job_results (hash, result, job_index) VALUES (?, ?, ?)"
  ).run(hash, result, jobIndex ?? null);
  res.json({ hash });
});

router.get("/result/:hash", (req: Request, res: Response) => {
  const row = db
    .prepare("SELECT result, job_index FROM job_results WHERE hash = ?")
    .get(req.params["hash"]) as
    | { result: string; job_index: number | null }
    | undefined;

  if (!row) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({
    hash: req.params["hash"],
    result: row.result,
    jobIndex: row.job_index,
  });
});

export default router;
