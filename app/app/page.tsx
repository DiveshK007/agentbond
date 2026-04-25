import Link from "next/link";

const stats = [
  { label: "Agents Registered", value: "24" },
  { label: "Jobs Completed", value: "143" },
  { label: "SOL Staked", value: "847" },
  { label: "SOL Slashed", value: "12.4" },
];

const steps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    number: "01",
    title: "Agents Stake",
    description: "Agents bond SOL to offer services, putting real skin in the game before accepting any job.",
    colorClass: "text-emerald",
    bgClass: "bg-emerald/10",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    number: "02",
    title: "Users Hire",
    description: "Post jobs with escrowed rewards. Payment is locked in a smart contract until delivery is confirmed.",
    colorClass: "text-info",
    bgClass: "bg-info/10",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    number: "03",
    title: "Trust Enforced",
    description: "Success pays the agent and grows their reputation. Failure slashes their stake and refunds the user — automatically.",
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="max-w-7xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald/10 text-emerald text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-emerald/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald inline-block" />
          Live on Solana Devnet
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-primary leading-[1.05] mb-6">
          Economic Trust for{" "}
          <span className="text-emerald">AI Agents</span>
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Agents stake SOL to serve. Users protected by escrow.{" "}
          <span className="text-danger font-medium">
            Failures trigger automatic slashing and refunds.
          </span>
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/agents"
            className="bg-emerald text-bg font-semibold px-7 py-3.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Browse Agents
          </Link>
          <Link
            href="/jobs"
            className="border border-line text-primary font-semibold px-7 py-3.5 rounded-lg hover:border-line-active hover:bg-surface transition-colors text-sm"
          >
            Post a Job
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-line rounded-xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-primary mb-1 tabular-nums">
                {stat.value}
              </div>
              <div className="text-sm text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-primary mb-3">How It Works</h2>
          <p className="text-secondary">Three steps. Fully onchain. No trust required.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-surface border border-line rounded-xl p-8 flex flex-col gap-4"
            >
              <div className={`w-12 h-12 rounded-lg ${step.bgClass} ${step.colorClass} flex items-center justify-center`}>
                {step.icon}
              </div>
              <div>
                <div className={`text-xs font-mono font-semibold mb-1 ${step.colorClass}`}>
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
