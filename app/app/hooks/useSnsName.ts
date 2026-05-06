"use client";

import { useEffect, useState } from "react";
import { resolveSnsName } from "@/lib/sns";

/**
 * Hook to resolve a Solana pubkey to its .sol domain name.
 * Returns { snsName, loading }.
 *
 * Usage:
 *   const { snsName } = useSnsName(agent.owner);
 *   // snsName = "alice.sol" or null
 */
export function useSnsName(pubkey: string | null | undefined) {
  const [snsName, setSnsName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pubkey) {
      setSnsName(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    resolveSnsName(pubkey).then((name) => {
      if (!cancelled) {
        setSnsName(name);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pubkey]);

  return { snsName, loading };
}
