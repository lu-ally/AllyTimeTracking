"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { vacationEntrySchema } from "@/lib/validations";
import { calculateVacationDays } from "@/lib/vacation-calculations";
import { revalidatePath } from "next/cache";

export async function createVacationEntry(data: unknown) {
  const session = await requireAuth();
  const parsed = vacationEntrySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Ungueltige Eingabe" };
  }

  const { startDate, endDate, halfDayStart, halfDayEnd, notes } = parsed.data;
  const start = new Date(startDate + "T00:00:00.000Z");
  const end = new Date(endDate + "T00:00:00.000Z");

  // Check for overlapping entries
  const overlapping = await db.vacationEntry.findFirst({
    where: {
      userId: session.user.id,
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });

  if (overlapping) {
    return {
      success: false as const,
      error: "Ueberlappung mit bestehendem Urlaubseintrag",
    };
  }

  await db.vacationEntry.create({
    data: {
      userId: session.user.id,
      startDate: start,
      endDate: end,
      halfDayStart,
      halfDayEnd,
      notes,
    },
  });

  revalidatePath("/vacation");
  revalidatePath("/team-calendar");
  return { success: true as const };
}

export async function deleteVacationEntry(id: string) {
  const session = await requireAuth();

  const entry = await db.vacationEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) {
    return { success: false as const, error: "Eintrag nicht gefunden" };
  }

  await db.vacationEntry.delete({ where: { id } });

  revalidatePath("/vacation");
  revalidatePath("/team-calendar");
  return { success: true as const };
}

export async function getVacationSummary(userId: string, year: number) {
  const balance = await db.vacationBalance.findUnique({
    where: { userId_year: { userId, year } },
  });

  const entries = await db.vacationEntry.findMany({
    where: {
      userId,
      startDate: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
      },
      endDate: {
        lte: new Date(`${year}-12-31T00:00:00.000Z`),
      },
    },
  });

  let usedDays = 0;
  for (const entry of entries) {
    usedDays += calculateVacationDays(
      entry.startDate,
      entry.endDate,
      entry.halfDayStart,
      entry.halfDayEnd
    );
  }

  const annualEntitlement = balance?.annualEntitlement ?? 30;
  const carryOver = balance?.carryOver ?? 0;
  const correction = balance?.correction ?? 0;
  const totalEntitlement = annualEntitlement + carryOver + correction;
  const remaining = totalEntitlement - usedDays;

  return {
    annualEntitlement,
    carryOver,
    correction,
    totalEntitlement,
    usedDays,
    remaining,
    entries,
  };
}
