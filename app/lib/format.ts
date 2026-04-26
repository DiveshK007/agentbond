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
