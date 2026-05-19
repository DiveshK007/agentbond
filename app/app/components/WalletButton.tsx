"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

/**
 * Detect whether any Solana wallet extension is available in the browser.
 * Returns true if Phantom, Solflare, or any standard adapter is present.
 */
function hasWalletExtension(): boolean {
  if (typeof window === "undefined") return true; // SSR — assume available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return !!(w.phantom?.solana || w.solflare || w.solana);
}

export default function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [showInstallHint, setShowInstallHint] = useState(false);

  function handleConnect() {
    if (hasWalletExtension()) {
      setShowInstallHint(false);
      setVisible(true);
    } else {
      setShowInstallHint(true);
    }
  }

  if (connecting) {
    return (
      <button
        disabled
        className="text-sm px-4 py-2 rounded-lg border border-line text-muted cursor-wait"
      >
        Connecting…
      </button>
    );
  }

  if (publicKey) {
    const display = `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-mono px-3 py-2 rounded-lg border"
          style={{
            background: "rgba(16,185,129,0.08)",
            borderColor: "rgba(16,185,129,0.25)",
            color: "#10b981",
          }}
        >
          {display}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-xs text-muted hover:text-danger transition-colors"
          title="Disconnect wallet"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        className="btn-gradient text-sm px-4 py-2 rounded-lg"
      >
        Connect Wallet
      </button>

      {showInstallHint && (
        <div
          className="absolute right-0 top-full mt-2 w-72 rounded-xl p-4 z-50"
          style={{
            background: "rgba(13,17,23,0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-primary">
              No wallet detected
            </p>
            <button
              onClick={() => setShowInstallHint(false)}
              className="text-muted hover:text-primary text-xs"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-muted mb-3 leading-relaxed">
            Install a Solana wallet extension to connect:
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ab9ff2",
              }}
            >
              <span style={{ fontSize: 14 }}>👻</span>
              <span className="font-medium">Phantom</span>
              <span className="text-muted ml-auto">↗</span>
            </a>
            <a
              href="https://solflare.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fc8227",
              }}
            >
              <span style={{ fontSize: 14 }}>🔆</span>
              <span className="font-medium">Solflare</span>
              <span className="text-muted ml-auto">↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
