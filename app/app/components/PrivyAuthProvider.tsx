"use client";

import { type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

/**
 * PrivyAuthProvider — Privy embedded-wallet authentication.
 *
 * Sits ALONGSIDE the existing Solana WalletProvider (Phantom/Solflare).
 * Users can choose:
 *   - Phantom/Solflare (crypto-native flow)
 *   - Privy (email/Google/Apple → auto-provisioned Solana embedded wallet)
 *
 * The embedded wallet means anyone with an email address can become an AgentBond
 * user without first installing a crypto wallet — critical for mainstream adoption.
 *
 * Set NEXT_PUBLIC_PRIVY_APP_ID in your environment to activate.
 * If unset, the provider is a no-op pass-through.
 */
export default function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  // Graceful degradation — if no Privy app ID, just render children
  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google", "apple", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#00e599",
          logo: "https://agentbond.io/logo.png",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(),
          },
        },
        defaultChain: undefined,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
