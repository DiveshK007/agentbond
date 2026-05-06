import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import WalletProvider from "./components/WalletProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AgentBond — Economic Trust for AI Agents",
  description: "The economic trust layer for AI agents on Solana",
};

const PROGRAM_ID = "5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-primary">
        <WalletProvider>
        <Navbar />
        {children}
        <footer className="mt-auto">
          <div
            className="h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)" }}
          />
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted"
            style={{ background: "rgba(10,10,10,0.8)" }}>
            <span>Built for Solana Frontier Hackathon 2026</span>
            <div className="flex items-center gap-4">
              <a
                href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald transition-colors font-mono"
              >
                {PROGRAM_ID.slice(0, 8)}…{PROGRAM_ID.slice(-4)}
              </a>
              <span className="text-line">·</span>
              <a
                href="https://github.com/DiveshK007/agentbond"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
