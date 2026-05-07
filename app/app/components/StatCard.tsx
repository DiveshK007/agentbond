"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  decimals = 0,
  suffix = "",
  delay = 0,
}: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 900;
    let startTime: number;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = parseFloat((eased * value).toFixed(decimals));
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, decimals, delay]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : display.toLocaleString();

  return (
    <div
      className="glass rounded-xl px-5 py-4"
      style={{ animation: `stat-in 0.5s ease-out ${delay}ms both` }}
    >
      <div
        className="text-2xl font-bold tabular-nums font-mono"
        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
      >
        {formatted}
        <span className="text-base font-normal" style={{ color: "var(--text-muted)" }}>
          {suffix}
        </span>
      </div>
      <div
        className="text-[11px] font-medium uppercase tracking-wider mt-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
    </div>
  );
}
