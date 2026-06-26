"use client";
import PageError from "../components/PageError";

export default function TransactionsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError title="History Unavailable" description="Failed to load transaction history. The API may be temporarily unreachable." error={error} reset={reset} />;
}
