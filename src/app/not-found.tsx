import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-heading">404</h1>
        <p className="text-muted-foreground">
          Die Seite wurde nicht gefunden.
        </p>
        <Button asChild>
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </div>
  );
}
