"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";

/**
 * PrivyButton — sign in with email/Google/Apple, get a Solana embedded wallet automatically.
 * Renders only when NEXT_PUBLIC_PRIVY_APP_ID is configured (otherwise null).
 *
 * The wrapper checks the env var BEFORE calling any Privy hooks — calling them
 * outside an active PrivyProvider throws.
 */
export default function PrivyButton() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) return null;
  return <PrivyButtonInner />;
}

function PrivyButtonInner() {
  const privy = usePrivy();
  const { wallets } = useWallets();

  if (!privy.ready) {
    return (
      <button
        disabled
        className="w-full px-4 py-2.5 rounded-lg border text-sm font-medium opacity-50"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        Loading Privy…
      </button>
    );
  }

  if (privy.authenticated) {
    const wallet = wallets[0];
    const pubkey = wallet?.address ?? "";
    const email = privy.user?.email?.address;
    return (
      <div className="flex flex-col gap-2 w-full">
        <div
          className="rounded-lg px-4 py-3 text-xs"
          style={{
            background: "rgba(0,229,153,0.06)",
            border: "1px solid rgba(0,229,153,0.2)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-secondary">{email ?? "Signed in via Privy"}</span>
              {pubkey && (
                <span className="text-accent font-mono text-[11px] truncate">
                  {pubkey.slice(0, 12)}…{pubkey.slice(-4)}
                </span>
              )}
            </div>
            <button
              onClick={() => privy.logout()}
              className="text-[11px] uppercase tracking-wider px-2 py-1 rounded border"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => privy.login()}
      className="w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.1)",
        color: "var(--text-primary)",
      }}
    >
      <span className="inline-flex items-center gap-2 justify-center">
        <span className="text-xs">✉</span>
        Sign in with Email · Google · Apple
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-mono"
          style={{ background: "rgba(0,229,153,0.1)", color: "var(--accent)" }}
        >
          Privy
        </span>
      </span>
    </button>
  );
}
