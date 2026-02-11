import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { TimeTrackingTabs } from "./tabs";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default async function TimeTrackingPage() {
  const session = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { weeklyHours: true },
  });

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(now);

  // Fetch entries for the full month (covers both week and month views)
  const entries = await db.timeEntry.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: new Date(startOfMonth(now).toISOString().split("T")[0] + "T00:00:00.000Z"),
        lte: new Date(monthEnd.toISOString().split("T")[0] + "T00:00:00.000Z"),
      },
    },
    orderBy: { date: "asc" },
  });

  const serializedEntries = entries.map((e) => ({
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    breakMinutes: e.breakMinutes,
    notes: e.notes,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zeiterfassung"
        description="Erfassen Sie Ihre Arbeitszeiten"
      />
      <TimeTrackingTabs
        entries={serializedEntries}
        weeklyHours={user?.weeklyHours ?? 40}
        initialDate={now}
      />
    </div>
  );
}
