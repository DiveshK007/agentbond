import { Router, Request, Response } from "express";
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const router = Router();

/**
 * File-backed metadata store for job descriptions and results.
 *
 * Data persists across API server restarts so bots can always
 * fetch job descriptions even after a deployment or crash.
 */

const STORE_DIR =
  process.env.METADATA_STORE_DIR ??
  join(homedir(), ".config", "agentbond", "metadata");

// Ensure storage directory exists
if (!existsSync(STORE_DIR)) {
  mkdirSync(STORE_DIR, { recursive: true });
}

const DESCRIPTIONS_FILE = join(STORE_DIR, "descriptions.json");
const RESULTS_FILE = join(STORE_DIR, "results.json");

function loadStore(filepath: string): Record<string, string> {
  try {
    if (existsSync(filepath)) {
      return JSON.parse(readFileSync(filepath, "utf8"));
    }
  } catch {
    console.warn(`[Metadata] Could not load ${filepath}, starting fresh`);
  }
  return {};
}

function saveStore(filepath: string, data: Record<string, string>): void {
  try {
    writeFileSync(filepath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`[Metadata] Could not save ${filepath}: ${String(err)}`);
  }
}

// Load persisted data on startup
const jobDescriptions: Record<string, string> = loadStore(DESCRIPTIONS_FILE);
const jobResults: Record<string, string> = loadStore(RESULTS_FILE);

/**
 * POST /api/metadata/job
 * Store a job description and return its SHA-256 hash.
 * The hash is used as the on-chain descriptionHash.
 */
router.post("/job", (req: Request, res: Response) => {
  const { description } = req.body as { description?: string };
  if (!description) {
    res.status(400).json({ error: "description required" });
    return;
  }
  const hash = createHash("sha256").update(description).digest("hex");
  jobDescriptions[hash] = description;
  saveStore(DESCRIPTIONS_FILE, jobDescriptions);
  res.json({ hash });
});

/**
 * GET /api/metadata/job/:hash
 * Retrieve a job description by its hash.
 */
router.get("/job/:hash", (req: Request, res: Response) => {
  const description = jobDescriptions[req.params["hash"]];
  if (!description) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({ hash: req.params["hash"], description });
});

/**
 * POST /api/metadata/result
 * Store a job result and return its SHA-256 hash.
 * The hash is used as the on-chain resultHash.
 */
router.post("/result", (req: Request, res: Response) => {
  const { result, jobIndex } = req.body as { result?: string; jobIndex?: number };
  if (!result) {
    res.status(400).json({ error: "result required" });
    return;
  }
  const hash = createHash("sha256").update(result).digest("hex");
  jobResults[hash] = JSON.stringify({ result, jobIndex });
  saveStore(RESULTS_FILE, jobResults);
  res.json({ hash });
});

/**
 * GET /api/metadata/result/:hash
 * Retrieve a job result by its hash.
 */
router.get("/result/:hash", (req: Request, res: Response) => {
  const raw = jobResults[req.params["hash"]];
  if (!raw) {
    res.status(404).json({ error: "not found" });
    return;
  }
  const data = JSON.parse(raw) as { result: string; jobIndex?: number };
  res.json({ hash: req.params["hash"], ...data });
});

export default router;
