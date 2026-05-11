"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const PROGRAM_ID = "5foUTphb99ztvEknWcEc5fNhvUsGx77pUiSsJi36d1L3";

/**
 * LayoutShell — wraps every page with the global Navbar + footer
 * EXCEPT the landing route (/), which renders its own custom nav and footer.
 */
export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    // Landing page renders its own nav + footer — pass through
    return <>{children}</>;
  }

  return (
    <>
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
    </>
  );
}
