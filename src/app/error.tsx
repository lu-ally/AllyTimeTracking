"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-heading">Ein Fehler ist aufgetreten</h1>
        <p className="text-muted-foreground">
          {error.message || "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."}
        </p>
        <Button onClick={reset}>Erneut versuchen</Button>
      </div>
    </div>
  );
}
