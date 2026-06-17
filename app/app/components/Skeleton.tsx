"use client";

/**
 * Shimmer skeleton loader — matches Terminal Noir aesthetic.
 * Use for cards, text lines, and stat blocks while data loads.
 */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Skeleton({ className = "", width, height, rounded = "lg" }: SkeletonProps) {
  const roundedClass = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  }[rounded];

  return (
    <div
      className={`skeleton-shimmer ${roundedClass} ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton width="40px" height="40px" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton height="14px" width="60%" />
          <Skeleton height="10px" width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height="12px" width="100%" />
        <Skeleton height="12px" width="80%" />
      </div>
      <div className="flex gap-2">
        <Skeleton height="24px" width="60px" rounded="full" />
        <Skeleton height="24px" width="80px" rounded="full" />
      </div>
    </div>
  );
}

export function SkeletonJobRow() {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-4">
      <div className="flex-1 space-y-2">
        <Skeleton height="14px" width="45%" />
        <Skeleton height="10px" width="30%" />
      </div>
      <Skeleton height="24px" width="70px" rounded="full" />
      <Skeleton height="14px" width="60px" />
    </div>
  );
}

export function SkeletonStatGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 space-y-2">
          <Skeleton height="10px" width="50%" />
          <Skeleton height="24px" width="70%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-line flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="12px" width={`${20 + i * 5}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-line flex gap-4 items-center" style={{ opacity: 1 - i * 0.15 }}>
          <Skeleton height="12px" width="25%" />
          <Skeleton height="12px" width="20%" />
          <Skeleton height="12px" width="30%" />
          <Skeleton height="24px" width="60px" rounded="full" />
        </div>
      ))}
    </div>
  );
}
