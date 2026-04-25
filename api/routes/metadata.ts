import { Router, Request, Response } from "express";
import { createHash } from "crypto";

const router = Router();
const jobDescriptions = new Map<string, string>();
const jobResults = new Map<string, string>();

router.post("/job", (req: Request, res: Response) => {
  const { description } = req.body as { description?: string };
  if (!description) {
    res.status(400).json({ error: "description required" });
    return;
  }
  const hash = createHash("sha256").update(description).digest("hex");
  jobDescriptions.set(hash, description);
  res.json({ hash });
});

router.get("/job/:hash", (req: Request, res: Response) => {
  const description = jobDescriptions.get(req.params["hash"]);
  if (!description) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({ hash: req.params["hash"], description });
});

router.post("/result", (req: Request, res: Response) => {
  const { result, jobIndex } = req.body as { result?: string; jobIndex?: number };
  if (!result) {
    res.status(400).json({ error: "result required" });
    return;
  }
  const hash = createHash("sha256").update(result).digest("hex");
  jobResults.set(hash, JSON.stringify({ result, jobIndex }));
  res.json({ hash });
});

router.get("/result/:hash", (req: Request, res: Response) => {
  const raw = jobResults.get(req.params["hash"]);
  if (!raw) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const data = JSON.parse(raw) as { result: string; jobIndex?: number };
  res.json({ hash: req.params["hash"], ...data });
});

export default router;
