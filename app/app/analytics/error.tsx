"use client";
import PageError from "../components/PageError";

export default function AnalyticsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError title="Analytics Unavailable" description="Failed to load protocol analytics. The API may be temporarily unreachable." error={error} reset={reset} />;
}
