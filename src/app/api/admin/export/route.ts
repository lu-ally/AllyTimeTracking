import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { calculateWorkedHours, getDailyTargetHours } from "@/lib/time-calculations";
import { format } from "date-fns";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate und endDate sind erforderlich" },
      { status: 400 }
    );
  }

  const users = await db.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, weeklyHours: true },
    orderBy: { name: "asc" },
  });

  const entries = await db.timeEntry.findMany({
    where: {
      date: {
        gte: new Date(startDate + "T00:00:00.000Z"),
        lte: new Date(endDate + "T00:00:00.000Z"),
      },
    },
    orderBy: [{ userId: "asc" }, { date: "asc" }],
  });

  // BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const headers = [
    "Mitarbeiter",
    "E-Mail",
    "Datum",
    "Start",
    "Ende",
    "Pause (min)",
    "Gearbeitet (Std)",
    "Soll (Std)",
    "Saldo (Std)",
    "Notizen",
  ];

  const rows: string[][] = [];

  for (const entry of entries) {
    const user = users.find((u) => u.id === entry.userId);
    if (!user) continue;

    const worked = calculateWorkedHours(
      entry.startTime,
      entry.endTime,
      entry.breakMinutes
    );
    const target = getDailyTargetHours(entry.date, user.weeklyHours);
    const balance = worked - target;

    rows.push([
      user.name,
      user.email,
      format(entry.date, "dd.MM.yyyy"),
      entry.startTime,
      entry.endTime,
      entry.breakMinutes.toString(),
      worked.toFixed(2),
      target.toFixed(2),
      balance.toFixed(2),
      entry.notes ?? "",
    ]);
  }

  const csvContent =
    BOM +
    headers.join(";") +
    "\n" +
    rows.map((row) => row.map((cell) => `"${cell}"`).join(";")).join("\n");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zeiterfassung-${startDate}-${endDate}.csv"`,
    },
  });
}
