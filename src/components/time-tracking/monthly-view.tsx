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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  calculateWorkedHours,
  getDailyTargetHours,
  formatHoursMinutes,
  formatBalance,
} from "@/lib/time-calculations";
import { isPublicHoliday } from "@/lib/holidays";

interface TimeEntryData {
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string | null;
}

interface MonthlyViewProps {
  initialEntries: TimeEntryData[];
  weeklyHours: number;
  initialDate: Date;
}

export function MonthlyView({
  initialEntries,
  weeklyHours,
  initialDate,
}: MonthlyViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [showWeekend, setShowWeekend] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  let totalWorked = 0;
  let totalTarget = 0;

  const dayData = allDays.map((day) => {
    const dateStr = day.toISOString().split("T")[0];
    const entry = initialEntries.find(
      (e) => e.date.toISOString().split("T")[0] === dateStr
    );
    const target = getDailyTargetHours(day, weeklyHours);
    const worked = entry
      ? calculateWorkedHours(entry.startTime, entry.endTime, entry.breakMinutes)
      : 0;

    const dayOfWeek = getDay(day);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holiday = isPublicHoliday(day);

    if (!isWeekend || showWeekend) {
      totalWorked += worked;
      totalTarget += target;
    }

    return { day, entry, target, worked, isWeekend, holiday, dateStr };
  });

  const filteredDays = showWeekend
    ? dayData
    : dayData.filter((d) => !d.isWeekend);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Heute
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="show-weekend-month"
            checked={showWeekend}
            onCheckedChange={setShowWeekend}
          />
          <Label htmlFor="show-weekend-month" className="text-sm">
            Wochenende
          </Label>
        </div>
      </div>

      <div className="grid gap-1.5 grid-cols-5 sm:grid-cols-7 lg:grid-cols-[repeat(auto-fill,minmax(80px,1fr))]">
        {filteredDays.map(
          ({ day, worked, target, holiday, isWeekend, entry }) => {
            const dayNum = format(day, "d");
            const dayName = format(day, "EEE", { locale: de });
            const balance = worked - target;

            let bgClass = "bg-background";
            if (holiday) bgClass = "bg-blue-50";
            else if (isWeekend) bgClass = "bg-muted/30";
            else if (entry) bgClass = "bg-emerald-50";

            return (
              <div
                key={day.toISOString()}
                className={`rounded-md border p-2 text-center text-xs ${bgClass}`}
              >
                <div className="text-muted-foreground capitalize">
                  {dayName}
                </div>
                <div className="text-lg font-semibold">{dayNum}</div>
                {holiday ? (
                  <div
                    className="truncate text-[10px] text-blue-600"
                    title={holiday.name}
                  >
                    {holiday.name}
                  </div>
                ) : worked > 0 ? (
                  <div className="font-mono text-xs">
                    {formatHoursMinutes(worked)}
                  </div>
                ) : target > 0 ? (
                  <div className="text-muted-foreground">--:--</div>
                ) : null}
              </div>
            );
          }
        )}
      </div>

      <div className="flex items-center gap-6 rounded-md border bg-muted/20 p-3 text-sm">
        <div>
          <span className="text-muted-foreground">Ist: </span>
          <span className="font-mono font-medium">
            {formatHoursMinutes(totalWorked)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Soll: </span>
          <span className="font-mono font-medium">
            {formatHoursMinutes(totalTarget)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Saldo: </span>
          <span
            className={`font-mono font-medium ${
              totalWorked - totalTarget >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {formatBalance(totalWorked - totalTarget)}
          </span>
        </div>
      </div>
    </div>
  );
}
