#!/usr/bin/env ts-node
/**
 * Checks that all keys in .env.example are present in the current environment.
 * Run from repo root: npx ts-node scripts/check-env.ts
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

const rootDir = join(__dirname, "..");
const examplePath = join(rootDir, ".env.example");
const envPath = join(rootDir, ".env");

config({ path: envPath });

if (!existsSync(examplePath)) {
  console.warn("No .env.example found at repo root — skipping check.");
  process.exit(0);
}

const exampleContent = readFileSync(examplePath, "utf8");
const keys = exampleContent
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => l.split("=")[0].trim())
  .filter(Boolean);

let missing = 0;
for (const key of keys) {
  if (!process.env[key]) {
    console.warn(`  MISSING  ${key}`);
    missing++;
  } else {
    console.log(`  OK       ${key}`);
  }
}

if (missing > 0) {
  console.error(`\n${missing} env var(s) not set. Copy .env.example → .env and fill them in.`);
  process.exit(1);
} else {
  console.log(`\nAll ${keys.length} env vars are set.`);
}
