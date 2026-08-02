"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-foreground">Something went wrong</p>
      <p className="text-sm text-foreground/50">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
