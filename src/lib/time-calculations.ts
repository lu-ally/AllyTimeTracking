import { isPublicHoliday } from "@/lib/holidays";

export function calculateWorkedHours(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const totalMinutes =
    endH * 60 + endM - (startH * 60 + startM) - breakMinutes;
  return Math.max(0, totalMinutes / 60);
}

export function getDailyTargetHours(
  date: Date,
  weeklyHours: number,
  state: string = "HH"
): number {
  const dayOfWeek = date.getDay();

  // Wochenende
  if (dayOfWeek === 0 || dayOfWeek === 6) return 0;

  // Feiertag
  if (isPublicHoliday(date, state)) return 0;

  // Werktag: Wochenstunden / 5
  return weeklyHours / 5;
}

export function formatHoursMinutes(hours: number): string {
  const sign = hours >= 0 ? "" : "-";
  const absHours = Math.abs(hours);
  const h = Math.floor(absHours);
  const m = Math.round((absHours - h) * 60);
  return `${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function formatBalance(hours: number): string {
  const sign = hours >= 0 ? "+" : "-";
  const absHours = Math.abs(hours);
  const h = Math.floor(absHours);
  const m = Math.round((absHours - h) * 60);
  return `${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
