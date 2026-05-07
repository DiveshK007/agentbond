"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Live Activity Feed — Makes the protocol feel alive.
 *
 * Displays a real-time scrolling ticker of protocol events.
 * Uses Server-Sent Events (SSE) when available, falls back to simulated events.
 */

interface ActivityEvent {
  id: string;
  type: "bid" | "complete" | "slash" | "register" | "job_posted" | "payout";
  message: string;
  bot?: string;
  amount?: string;
  timestamp: number;
}

const EVENT_TEMPLATES: Omit<ActivityEvent, "id" | "timestamp">[] = [
  { type: "complete", message: "PriceBot completed Job #38 — earned 0.01 SOL", bot: "PriceBot", amount: "+0.01" },
  { type: "bid", message: "SwapBot bid on Job #42 — 0.075 SOL", bot: "SwapBot", amount: "0.075" },
  { type: "slash", message: "FailBot SLASHED on Job #35 — lost 0.05 SOL", bot: "FailBot", amount: "-0.05" },
  { type: "job_posted", message: "New job: \"Fetch SOL/USD price\" — 0.1 SOL reward" },
  { type: "complete", message: "OracleBot completed Job #39 — verified via Switchboard", bot: "OracleBot", amount: "+0.008" },
  { type: "payout", message: "CrossChainBot earned 0.075 SOL — Solana→Ethereum quote delivered", bot: "CrossChainBot", amount: "+0.075" },
  { type: "register", message: "New agent registered: PortfolioBot — staked 1.5 SOL", bot: "PortfolioBot", amount: "1.5" },
  { type: "bid", message: "PriceBot bid on Job #43 — 0.01 SOL", bot: "PriceBot", amount: "0.01" },
  { type: "complete", message: "SwapBot completed Job #40 — SOL→USDC swap executed", bot: "SwapBot", amount: "+0.05" },
  { type: "slash", message: "FailBot timed out on Job #41 — 0.025 SOL slashed", bot: "FailBot", amount: "-0.025" },
  { type: "job_posted", message: "New job: \"Cross-chain quote ETH→SOL\" — 0.075 SOL reward" },
  { type: "payout", message: "PortfolioBot earned 0.005 SOL — portfolio summary delivered", bot: "PortfolioBot", amount: "+0.005" },
];

const TYPE_ICONS: Record<string, string> = {
  bid: "›",
  complete: "✓",
  slash: "✕",
  register: "+",
  job_posted: "○",
  payout: "◎",
};

const TYPE_COLORS: Record<string, string> = {
  bid: "#4d94ff",
  complete: "#00e599",
  slash: "#ff4d6a",
  register: "#a78bfa",
  job_posted: "#ffb224",
  payout: "#00ccaa",
};

export default function ActivityFeed({ maxEvents = 6 }: { maxEvents?: number }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const indexRef = useRef(0);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  // Try SSE first, fall back to simulated events
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    // Try connecting to SSE feed
    try {
      const eventSource = new EventSource(`${API_BASE}/api/feed`);
      let sseWorking = false;

      eventSource.onmessage = (e) => {
        sseWorking = true;
        try {
          const event = JSON.parse(e.data) as ActivityEvent;
          setEvents((prev) => [event, ...prev].slice(0, maxEvents));
        } catch {}
      };

      eventSource.onerror = () => {
        if (!sseWorking) {
          eventSource.close();
          // Fall back to simulated events
          startSimulation();
        }
      };

      // Give SSE 2 seconds to connect before falling back
      const timeout = setTimeout(() => {
        if (!sseWorking) {
          eventSource.close();
          startSimulation();
        }
      }, 2000);

      cleanup = () => {
        clearTimeout(timeout);
        eventSource.close();
      };
    } catch {
      startSimulation();
    }

    function startSimulation() {
      // Seed with 3 initial events
      const initial: ActivityEvent[] = [];
      for (let i = 0; i < 3; i++) {
        const template = EVENT_TEMPLATES[i % EVENT_TEMPLATES.length];
        initial.push({
          ...template,
          id: `sim-${i}`,
          timestamp: Date.now() - (3 - i) * 15000,
        });
      }
      setEvents(initial);
      indexRef.current = 3;

      // Add new events periodically
      const interval = setInterval(() => {
        const template = EVENT_TEMPLATES[indexRef.current % EVENT_TEMPLATES.length];
        const newEvent: ActivityEvent = {
          ...template,
          id: `sim-${indexRef.current}`,
          timestamp: Date.now(),
        };
        indexRef.current++;
        setEvents((prev) => [newEvent, ...prev].slice(0, maxEvents));
      }, 3000 + Math.random() * 2000);

      cleanup = () => clearInterval(interval);
    }

    return () => cleanup?.();
  }, [maxEvents, API_BASE]);

  if (events.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {events.map((event, i) => {
        const age = Math.max(1, Math.round((Date.now() - event.timestamp) / 1000));
        const ageStr = age < 60 ? `${age}s ago` : `${Math.round(age / 60)}m ago`;
        const color = TYPE_COLORS[event.type] ?? "#a3a3a3";

        return (
          <div
            key={event.id}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500"
            style={{
              background: i === 0 ? `${color}08` : "rgba(255,255,255,0.02)",
              border: `1px solid ${i === 0 ? `${color}20` : "rgba(255,255,255,0.04)"}`,
              animation: i === 0 ? "slide-up 0.4s ease-out" : undefined,
              opacity: 1 - i * 0.1,
            }}
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0"
              style={{
                background: `${color}12`,
                color: color,
                border: `1px solid ${color}20`,
              }}
            >
              {TYPE_ICONS[event.type] ?? "·"}
            </span>
            <span className="text-sm flex-1 truncate" style={{ color: "var(--text-secondary)" }}>
              {event.message}
            </span>
            {event.amount && (
              <span
                className="text-xs font-mono font-medium shrink-0"
                style={{
                  color: event.amount.startsWith("-") ? "#ff4d6a" : event.amount.startsWith("+") ? "#00e599" : "var(--text-muted)",
                }}
              >
                {event.amount} SOL
              </span>
            )}
            <span className="text-[10px] font-mono shrink-0 w-14 text-right" style={{ color: "var(--text-muted)" }}>
              {ageStr}
            </span>
          </div>
        );
      })}
    </div>
  );
}
