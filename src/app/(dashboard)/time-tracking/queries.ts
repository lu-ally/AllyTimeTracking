import { db } from "@/lib/db";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  calculateWorkedHours,
  getDailyTargetHours,
} from "@/lib/time-calculations";

export async function getWeekEntries(userId: string, weekStart: Date) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });

  return db.timeEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start.toISOString().split("T")[0] + "T00:00:00.000Z"),
        lte: new Date(end.toISOString().split("T")[0] + "T00:00:00.000Z"),
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getMonthEntries(
  userId: string,
  year: number,
  month: number
) {
  const date = new Date(year, month - 1, 1);
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return db.timeEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(start.toISOString().split("T")[0] + "T00:00:00.000Z"),
        lte: new Date(end.toISOString().split("T")[0] + "T00:00:00.000Z"),
      },
    },
    orderBy: { date: "asc" },
  });
}

export async function getUserTotalBalance(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { weeklyHours: true, createdAt: true },
  });

  if (!user) return 0;

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const startDate =
    user.createdAt > yearStart ? user.createdAt : yearStart;

  const entries = await db.timeEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(
          startDate.toISOString().split("T")[0] + "T00:00:00.000Z"
        ),
        lte: new Date(now.toISOString().split("T")[0] + "T00:00:00.000Z"),
      },
    },
  });

  const days = eachDayOfInterval({ start: startDate, end: now });
  let totalWorked = 0;
  let totalTarget = 0;

  for (const day of days) {
    const dateStr = day.toISOString().split("T")[0];
    totalTarget += getDailyTargetHours(day, user.weeklyHours);

    const entry = entries.find(
      (e) => e.date.toISOString().split("T")[0] === dateStr
    );
    if (entry) {
      totalWorked += calculateWorkedHours(
        entry.startTime,
        entry.endTime,
        entry.breakMinutes
      );
    }
  }

  return totalWorked - totalTarget;
}
