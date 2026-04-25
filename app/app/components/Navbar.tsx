import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-line">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-emerald font-bold text-xl tracking-tight"
        >
          ⚡ AgentBond
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/agents"
            className="text-secondary hover:text-primary text-sm transition-colors"
          >
            Agents
          </Link>
          <Link
            href="/jobs"
            className="text-secondary hover:text-primary text-sm transition-colors"
          >
            Jobs
          </Link>
          <Link
            href="/dashboard"
            className="text-secondary hover:text-primary text-sm transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/register"
            className="bg-emerald text-bg text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Register Agent
          </Link>
        </div>
      </div>
    </nav>
  );
}
