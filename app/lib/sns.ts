import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  performReverseLookup,
} from "@bonfida/spl-name-service";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

// In-memory cache to avoid hammering the RPC
const cache = new Map<string, string | null>();

/**
 * Attempt to resolve a Solana pubkey to its `.sol` domain name.
 * Returns the domain (e.g. "alice.sol") or null if none exists.
 *
 * Uses mainnet-beta since SNS domains are only registered there.
 * Results are cached in-memory for the lifetime of the page.
 */
export async function resolveSnsName(
  pubkey: string
): Promise<string | null> {
  if (cache.has(pubkey)) {
    return cache.get(pubkey)!;
  }

  try {
    const owner = new PublicKey(pubkey);
    const domainName = await performReverseLookup(connection, owner);
    const result = domainName ? `${domainName}.sol` : null;
    cache.set(pubkey, result);
    return result;
  } catch {
    // No domain registered or RPC error — cache as null to avoid retries
    cache.set(pubkey, null);
    return null;
  }
}

/**
 * Format a pubkey for display: returns the .sol name if available,
 * otherwise falls back to truncated base58.
 */
export function formatPubkeyOrSns(
  pubkey: string,
  snsName: string | null
): string {
  if (snsName) return snsName;
  return `${pubkey.slice(0, 4)}…${pubkey.slice(-4)}`;
}
