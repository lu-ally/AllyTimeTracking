"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h2 className="text-xl font-heading">Ein Fehler ist aufgetreten</h2>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        {error.message || "Etwas ist schiefgelaufen."}
      </p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  );
}
