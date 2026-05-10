/**
 * Startup environment validation.
 * Logs warnings for missing optional keys so operators know
 * which features will be degraded, rather than discovering it at runtime.
 */

interface EnvVar {
  key: string;
  description: string;
  required: boolean;
}

const ENV_VARS: EnvVar[] = [
  { key: "RPC_URL", description: "Solana RPC endpoint", required: false },
  { key: "X402_RECEIVER_ADDRESS", description: "x402 payment receiver wallet — all /api/services/* endpoints broken without this", required: false },
  { key: "HELIUS_API_KEY", description: "Helius webhook monitoring + enhanced transaction history", required: false },
  { key: "ZERION_API_KEY", description: "Zerion portfolio aggregation (/api/services/portfolio)", required: false },
  { key: "LIFI_API_KEY", description: "LI.FI cross-chain swap quotes", required: false },
];

export function validateEnv(): void {
  const missing = ENV_VARS.filter(({ key, required }) => required && !process.env[key]);
  const degraded = ENV_VARS.filter(({ key, required }) => !required && !process.env[key]);

  if (missing.length > 0) {
    console.error("[env] FATAL: Required environment variables are missing:");
    for (const { key, description } of missing) {
      console.error(`  ✗ ${key}  — ${description}`);
    }
    process.exit(1);
  }

  if (degraded.length > 0) {
    console.warn("[env] Some features will be degraded (optional vars not set):");
    for (const { key, description } of degraded) {
      console.warn(`  · ${key}  — ${description}`);
    }
  }
}
