export function lamportsToSol(lamports: string | number): number {
  return Number(lamports) / 1_000_000_000;
}

export function formatSol(lamports: string | number, decimals = 3): string {
  const sol = lamportsToSol(lamports);
  return sol === 0 ? "0" : sol.toFixed(decimals).replace(/\.?0+$/, "");
}

export function reputationDisplay(rep: number): string {
  return (rep / 100).toFixed(2);
}

export function completionRate(completed: number, failed: number): number {
  const total = completed + failed;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function repColorClass(rep: number): string {
  if (rep > 7500) return "text-emerald";
  if (rep > 5000) return "text-warning";
  return "text-danger";
}

export function repBadgeClass(rep: number): string {
  if (rep > 7500) return "bg-emerald/10 text-emerald border-emerald/20";
  if (rep > 5000) return "bg-warning/10 text-warning border-warning/20";
  return "bg-danger/10 text-danger border-danger/20";
}

export function truncatePubkey(pubkey: string): string {
  return `${pubkey.slice(0, 4)}…${pubkey.slice(-4)}`;
}

export function agentDisplayName(name: string, owner: string): string {
  return name.trim() || truncatePubkey(owner);
}

export const JOB_STATUS_LABEL: Record<number, string> = {
  0: "Open",
  1: "Assigned",
  2: "Submitted",
  3: "Completed",
  4: "Disputed",
  5: "Cancelled",
  6: "Timed Out",
};

export const JOB_STATUS_CLASS: Record<number, string> = {
  0: "bg-info/10 text-info border-info/20",
  1: "bg-warning/10 text-warning border-warning/20",
  2: "bg-accent/10 text-accent border-accent/20",
  3: "bg-emerald/10 text-emerald border-emerald/20",
  4: "bg-danger/10 text-danger border-danger/20",
  5: "bg-elevated text-muted border-line",
  6: "bg-elevated text-muted border-line",
};

export function jobModeName(mode: number): string {
  return mode === 1 ? "Instant" : "Job Board";
}

export function formatDeadline(deadlineUnix: number): string {
  const remaining = deadlineUnix - Math.floor(Date.now() / 1000);
  if (remaining <= 0) return "Expired";
  const days = Math.floor(remaining / 86_400);
  const hours = Math.floor((remaining % 86_400) / 3_600);
  const minutes = Math.floor((remaining % 3_600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTimestamp(unix: number): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SYSTEM_PUBKEY = "11111111111111111111111111111111";

export function isDefaultPubkey(pubkey: string): boolean {
  return pubkey === SYSTEM_PUBKEY || /^0+$/.test(pubkey);
}

export function isEmptyHash(hash: string): boolean {
  return /^0+$/.test(hash);
}

export function truncateHash(hash: string, len = 8): string {
  return hash.slice(0, len);
}
