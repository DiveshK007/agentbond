"use client";
import PageError from "../../components/PageError";

export default function AgentDetailError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError title="Agent Not Found" description="Could not load this agent's profile. It may not exist or the API is unreachable." error={error} reset={reset} />;
}
