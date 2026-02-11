import { isPublicHoliday } from "@/lib/holidays";

export function calculateVacationDays(
  startDate: Date,
  endDate: Date,
  halfDayStart: boolean,
  halfDayEnd: boolean,
  state: string = "HH"
): number {
  let days = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = !!isPublicHoliday(current, state);

    if (!isWeekend && !isHoliday) {
      const isFirst = current.toDateString() === startDate.toDateString();
      const isLast = current.toDateString() === endDate.toDateString();

      if (isFirst && halfDayStart) {
        days += 0.5;
      } else if (isLast && halfDayEnd) {
        days += 0.5;
      } else {
        days += 1;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return days;
}
