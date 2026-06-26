"use client";
import PageError from "../../components/PageError";

export default function JobDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError title="Job Not Found" description="Could not load this job's details. It may not exist or the API is unreachable." error={error} reset={reset} />;
}
