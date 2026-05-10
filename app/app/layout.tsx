import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import WalletProvider from "./components/WalletProvider";
import PrivyAuthProvider from "./components/PrivyAuthProvider";

/**
 * Typography:
 * - Space Grotesk: Geometric, technical display font. NOT Inter/Roboto.
 *   Chosen for its sharp, engineered feel — matches "protocol monitoring" aesthetic.
 * - JetBrains Mono: Data, addresses, hashes. The language of the chain.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AgentBond — Trustless Accountability for AI Agents",
  description:
    "The economic trust layer for autonomous AI agents on Solana. Stake, execute, get paid — or get slashed.",
};

const PROGRAM_ID = "5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-primary">
        <PrivyAuthProvider>
          <WalletProvider>
            <Navbar />
            {children}
            <footer className="mt-auto">
              <div className="divider" />
              <div
                className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="gradient-text font-bold text-sm">AgentBond</span>
                  <span style={{ color: "var(--border-active)" }}>·</span>
                  <span>Solana Frontier Hackathon 2026</span>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <a
                    href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {PROGRAM_ID.slice(0, 8)}…{PROGRAM_ID.slice(-4)}
                  </a>
                  <span style={{ color: "var(--border)" }}>|</span>
                  <a
                    href="https://github.com/DiveshK007/agentbond"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                    style={{ color: "var(--text-muted)" }}
                  >
                    GitHub ↗
                  </a>
                </div>
              </div>
            </footer>
          </WalletProvider>
        </PrivyAuthProvider>
      </body>
    </html>
  );
}
