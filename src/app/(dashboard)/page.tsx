import { requireAuth } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/layout/stat-card";
import { Clock, CalendarDays, TrendingUp, Palmtree } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Willkommen, ${session.user.name}`}
        description="Ihr persoenliches Dashboard"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Heute"
          value="--:--"
          description="Noch keine Eintraege"
          icon={Clock}
        />
        <StatCard
          title="Diese Woche"
          value="--:-- / --:--"
          description="Ist / Soll"
          icon={TrendingUp}
        />
        <StatCard
          title="Dieser Monat"
          value="--:-- / --:--"
          description="Ist / Soll"
          icon={CalendarDays}
        />
        <StatCard
          title="Resturlaub"
          value="-- Tage"
          description="Verbleibend"
          icon={Palmtree}
        />
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/time-tracking">Zeiterfassung</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/vacation">Urlaub eintragen</Link>
        </Button>
      </div>
    </div>
  );
}
