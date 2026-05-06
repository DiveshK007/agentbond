"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export default function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

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
    <button
      onClick={() => setVisible(true)}
      className="btn-gradient text-sm px-4 py-2 rounded-lg"
    >
      Connect Wallet
    </button>
  );
}
