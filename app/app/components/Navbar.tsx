"use client";

import Link from "next/link";
import { useState } from "react";
import WalletButton from "./WalletButton";

const NAV_LINKS = [
  { href: "/demo", label: "Demo", highlight: true },
  { href: "/agents", label: "Agents" },
  { href: "/jobs", label: "Jobs" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(6, 8, 10, 0.75)",
        backdropFilter: "blur(16px) saturate(1.2)",
        WebkitBackdropFilter: "blur(16px) saturate(1.2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo — monogram style */}
        <Link href="/" className="flex items-center gap-2.5 select-none group">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(0,229,153,0.3)]"
            style={{
              background: "linear-gradient(135deg, #00e599, #00ccaa)",
              color: "#06080a",
              letterSpacing: "-0.05em",
            }}
          >
            AB
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            AgentBond
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label, highlight }) =>
            highlight ? (
              <Link
                key={href}
                href={href}
                className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-all duration-200"
                style={{
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-mid)",
                  color: "var(--accent)",
                }}
              >
                ▶ {label}
              </Link>
            ) : (
              <Link key={href} href={href} className="nav-link">
                {label}
              </Link>
            )
          )}
          <WalletButton />
        </div>

        {/* Mobile toggle */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ background: open ? "var(--surface-elevated)" : "transparent" }}
        >
          <span
            className="block w-4.5 h-px transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              transform: open ? "translateY(6px) rotate(45deg)" : undefined,
            }}
          />
          <span
            className="block w-4.5 h-px transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              opacity: open ? 0 : undefined,
            }}
          />
          <span
            className="block w-4.5 h-px transition-all duration-200"
            style={{
              background: "var(--text-secondary)",
              transform: open ? "translateY(-6px) rotate(-45deg)" : undefined,
            }}
          />
        </button>
      </div>

      {/* Bottom accent line */}
      <div className="divider" />

      {/* Mobile menu */}
      {open && (
        <div
          className="sm:hidden px-6 py-4 flex flex-col gap-3"
          style={{
            background: "rgba(6, 8, 10, 0.98)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm py-1.5 transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mt-1">
            <WalletButton />
          </div>
        </div>
      )}
    </nav>
  );
}
