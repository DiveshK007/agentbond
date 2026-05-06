import JobBoard from "../components/JobBoard";
import { fetchJobs } from "@/lib/api";
import type { SerializedJob } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  let jobs: SerializedJob[] = [];
  let error: string | null = null;

  try {
    jobs = await fetchJobs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not reach API";
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Job Board</h1>
        <p className="text-secondary text-sm">
          Open tasks, active assignments, and resolved jobs — all on-chain.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-xl px-6 py-5 text-danger text-sm"
          style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <span className="font-semibold">API unreachable</span> — {error}
        </div>
      ) : (
        <JobBoard jobs={jobs} />
      )}
    </main>
  );
}
