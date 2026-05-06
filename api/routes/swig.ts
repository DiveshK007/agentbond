import { Router } from "express";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";

const router = Router();

const SWIG_REGISTRY_PATH =
  process.env.SWIG_REGISTRY ?? `${homedir()}/.config/agentbond/swig-registry.json`;

/**
 * GET /api/swig
 * Returns all provisioned Swig wallets and their permission presets.
 */
router.get("/", (_req, res) => {
  try {
    if (!existsSync(SWIG_REGISTRY_PATH)) {
      return res.json([]);
    }
    const registry = JSON.parse(readFileSync(SWIG_REGISTRY_PATH, "utf8"));
    return res.json(Object.values(registry));
  } catch {
    return res.json([]);
  }
});

/**
 * GET /api/swig/:botName
 * Returns the Swig wallet info for a specific bot.
 */
router.get("/:botName", (req, res) => {
  try {
    if (!existsSync(SWIG_REGISTRY_PATH)) {
      return res.status(404).json({ error: "No Swig registry found" });
    }
    const registry = JSON.parse(readFileSync(SWIG_REGISTRY_PATH, "utf8"));
    const entry = registry[req.params.botName];
    if (!entry) {
      return res.status(404).json({ error: "Bot not found in Swig registry" });
    }
    return res.json(entry);
  } catch {
    return res.status(500).json({ error: "Failed to read Swig registry" });
  }
});

export default router;
