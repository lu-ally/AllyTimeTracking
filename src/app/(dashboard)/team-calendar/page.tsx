import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { TeamCalendar } from "@/components/vacation/team-calendar";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

export default async function TeamCalendarPage() {
  await requireAuth();

  const now = new Date();
  // Fetch entries for 3 months range to cover navigation
  const rangeStart = startOfMonth(subMonths(now, 1));
  const rangeEnd = endOfMonth(addMonths(now, 1));

  const users = await db.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      vacationEntries: {
        where: {
          OR: [
            { startDate: { gte: rangeStart, lte: rangeEnd } },
            { endDate: { gte: rangeStart, lte: rangeEnd } },
            { startDate: { lte: rangeStart }, endDate: { gte: rangeEnd } },
          ],
        },
        select: {
          id: true,
          userId: true,
          startDate: true,
          endDate: true,
          halfDayStart: true,
          halfDayEnd: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const userData = users.map((u) => ({
    id: u.id,
    name: u.name,
    entries: u.vacationEntries,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teamkalender"
        description="Urlaubsuebersicht aller Mitarbeiter"
      />
      <TeamCalendar users={userData} initialDate={now} />
    </div>
  );
}
