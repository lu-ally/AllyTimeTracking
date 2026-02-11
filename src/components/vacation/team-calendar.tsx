"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isPublicHoliday } from "@/lib/holidays";

interface VacationEntry {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  halfDayStart: boolean;
  halfDayEnd: boolean;
}

interface UserData {
  id: string;
  name: string;
  entries: VacationEntry[];
}

interface TeamCalendarProps {
  users: UserData[];
  initialDate: Date;
}

export function TeamCalendar({ users, initialDate }: TeamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [filter, setFilter] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredUsers = filter
    ? users.filter((u) =>
        u.name.toLowerCase().includes(filter.toLowerCase())
      )
    : users;

  function isOnVacation(userId: string, day: Date): { full: boolean; half: boolean } {
    const user = users.find((u) => u.id === userId);
    if (!user) return { full: false, half: false };

    for (const entry of user.entries) {
      const start = new Date(entry.startDate);
      const end = new Date(entry.endDate);

      if (day >= start && day <= end) {
        const isFirst = day.toDateString() === start.toDateString();
        const isLast = day.toDateString() === end.toDateString();

        if ((isFirst && entry.halfDayStart) || (isLast && entry.halfDayEnd)) {
          return { full: false, half: true };
        }
        return { full: true, half: false };
      }
    }
    return { full: false, half: false };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center font-medium">
            {format(currentDate, "MMMM yyyy", { locale: de })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Input
          placeholder="Mitarbeiter filtern..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-48"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium">
                Mitarbeiter
              </th>
              {days.map((day) => {
                const dayOfWeek = getDay(day);
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const holiday = isPublicHoliday(day);

                return (
                  <th
                    key={day.toISOString()}
                    className={`min-w-[28px] px-0.5 py-2 text-center font-normal ${
                      isWeekend
                        ? "bg-muted/30"
                        : holiday
                          ? "bg-blue-50"
                          : ""
                    }`}
                    title={
                      holiday
                        ? holiday.name
                        : format(day, "EEEE, dd.MM.", { locale: de })
                    }
                  >
                    <div className="text-muted-foreground">
                      {format(day, "EEE", { locale: de }).slice(0, 2)}
                    </div>
                    <div>{format(day, "d")}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="sticky left-0 z-10 bg-background px-3 py-1.5 font-medium">
                  {user.name}
                </td>
                {days.map((day) => {
                  const dayOfWeek = getDay(day);
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  const holiday = isPublicHoliday(day);
                  const vacation = isOnVacation(user.id, day);

                  let cellClass = "";
                  if (vacation.full) cellClass = "bg-blue-400";
                  else if (vacation.half) cellClass = "bg-blue-200";
                  else if (holiday) cellClass = "bg-blue-50";
                  else if (isWeekend) cellClass = "bg-muted/30";

                  return (
                    <td
                      key={day.toISOString()}
                      className={`px-0.5 py-1.5 text-center ${cellClass}`}
                      title={
                        vacation.full
                          ? "Urlaub"
                          : vacation.half
                            ? "Halber Tag"
                            : holiday
                              ? holiday.name
                              : ""
                      }
                    >
                      {vacation.half && (
                        <span className="text-[10px] text-blue-700">/</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-400" />
          <span>Urlaub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-200" />
          <span>Halber Tag</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-50 border" />
          <span>Feiertag</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-muted/50 border" />
          <span>Wochenende</span>
        </div>
      </div>
    </div>
  );
}
