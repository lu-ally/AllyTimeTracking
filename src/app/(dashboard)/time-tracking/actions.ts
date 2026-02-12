"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { timeEntrySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function upsertTimeEntry(data: unknown) {
  const session = await requireAuth();
  const parsed = timeEntrySchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    return { success: false as const, error: `Ungueltige Eingabe: ${issues}` };
  }

  const { date, startTime, endTime, breakMinutes, notes } = parsed.data;
  const dateObj = new Date(date + "T00:00:00.000Z");

  await db.timeEntry.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: dateObj,
      },
    },
    update: { startTime, endTime, breakMinutes, notes },
    create: {
      userId: session.user.id,
      date: dateObj,
      startTime,
      endTime,
      breakMinutes,
      notes,
    },
  });

  revalidatePath("/time-tracking");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteTimeEntry(date: string) {
  const session = await requireAuth();
  const dateObj = new Date(date + "T00:00:00.000Z");

  await db.timeEntry.delete({
    where: {
      userId_date: {
        userId: session.user.id,
        date: dateObj,
      },
    },
  });

  revalidatePath("/time-tracking");
  revalidatePath("/");
  return { success: true as const };
}
