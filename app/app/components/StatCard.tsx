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
      className="bg-surface border border-line rounded-xl p-6 text-center"
      style={{
        animation: `stat-in 0.5s ease-out ${delay}ms both`,
      }}
    >
      <div className="text-3xl font-bold text-primary mb-1 tabular-nums">
        {formatted}
        {suffix}
      </div>
      <div className="text-sm text-secondary">{label}</div>
    </div>
  );
}
