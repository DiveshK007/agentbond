"use client";

import Link from "next/link";
import { useState } from "react";
import WalletButton from "./WalletButton";

const NAV_LINKS = [
  { href: "/demo", label: "Try Demo", highlight: true },
  { href: "/agents", label: "Agents" },
  { href: "/jobs", label: "Jobs" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: "rgba(20, 20, 20, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="gradient-text font-bold text-xl tracking-tight select-none">
          AgentBond
        </Link>

        <div className="hidden sm:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label, highlight }) =>
            highlight ? (
              <Link
                key={href}
                href={href}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10b981",
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

        <button
          className="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-elevated transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-5 h-0.5 bg-secondary transition-all duration-200"
            style={{ transform: open ? "translateY(8px) rotate(45deg)" : undefined }}
          />
          <span
            className="block w-5 h-0.5 bg-secondary transition-all duration-200"
            style={{ opacity: open ? 0 : undefined }}
          />
          <span
            className="block w-5 h-0.5 bg-secondary transition-all duration-200"
            style={{ transform: open ? "translateY(-8px) rotate(-45deg)" : undefined }}
          />
        </button>
      </div>

      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.25), transparent)" }}
      />

      {open && (
        <div
          className="sm:hidden px-6 py-4 flex flex-col gap-3 border-b border-line"
          style={{ background: "rgba(10, 10, 10, 0.98)", backdropFilter: "blur(16px)" }}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-secondary hover:text-primary text-sm transition-colors py-1.5"
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
