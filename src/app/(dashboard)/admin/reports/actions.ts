"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  calculateWorkedHours,
  getDailyTargetHours,
} from "@/lib/time-calculations";

interface UserReport {
  userId: string;
  userName: string;
  userEmail: string;
  targetHours: number;
  actualHours: number;
  monthBalance: number;
  totalBalance: number;
}

export async function getMonthlyReport(
  year: number,
  month: number
): Promise<UserReport[]> {
  await requireAdmin();

  const monthDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const yearStart = new Date(year, 0, 1);

  const users = await db.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      weeklyHours: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  const reports: UserReport[] = [];

  for (const user of users) {
    // Month entries
    const monthEntries = await db.timeEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(monthStart.toISOString().split("T")[0] + "T00:00:00.000Z"),
          lte: new Date(monthEnd.toISOString().split("T")[0] + "T00:00:00.000Z"),
        },
      },
    });

    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    let monthTarget = 0;
    let monthActual = 0;

    for (const day of monthDays) {
      monthTarget += getDailyTargetHours(day, user.weeklyHours);
      const dateStr = day.toISOString().split("T")[0];
      const entry = monthEntries.find(
        (e) => e.date.toISOString().split("T")[0] === dateStr
      );
      if (entry) {
        monthActual += calculateWorkedHours(
          entry.startTime,
          entry.endTime,
          entry.breakMinutes
        );
      }
    }

    // Total balance (from start of year or user creation)
    const startDate = user.createdAt > yearStart ? user.createdAt : yearStart;
    const now = monthEnd < new Date() ? monthEnd : new Date();

    const allEntries = await db.timeEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(startDate.toISOString().split("T")[0] + "T00:00:00.000Z"),
          lte: new Date(now.toISOString().split("T")[0] + "T00:00:00.000Z"),
        },
      },
    });

    const allDays = eachDayOfInterval({ start: startDate, end: now });
    let totalTarget = 0;
    let totalActual = 0;

    for (const day of allDays) {
      totalTarget += getDailyTargetHours(day, user.weeklyHours);
      const dateStr = day.toISOString().split("T")[0];
      const entry = allEntries.find(
        (e) => e.date.toISOString().split("T")[0] === dateStr
      );
      if (entry) {
        totalActual += calculateWorkedHours(
          entry.startTime,
          entry.endTime,
          entry.breakMinutes
        );
      }
    }

    reports.push({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      targetHours: monthTarget,
      actualHours: monthActual,
      monthBalance: monthActual - monthTarget,
      totalBalance: totalActual - totalTarget,
    });
  }

  return reports;
}
