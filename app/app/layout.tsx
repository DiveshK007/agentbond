import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-primary">
        <Navbar />
        {children}
        <footer className="mt-auto border-t border-line">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <span>Built for Solana Frontier Hackathon 2026</span>
            <div className="flex items-center gap-4">
              <a
                href={`https://explorer.solana.com/address/${PROGRAM_ID}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors font-mono"
              >
                Program: {PROGRAM_ID.slice(0, 8)}…{PROGRAM_ID.slice(-4)}
              </a>
              <span className="text-line">·</span>
              <a
                href="https://github.com/DiveshK007/agentbond"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
              >
                Open Source on GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
