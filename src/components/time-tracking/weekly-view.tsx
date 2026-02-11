"use client";

import { useState } from "react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
  getISOWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { DayRow } from "./day-row";
import {
  calculateWorkedHours,
  getDailyTargetHours,
  formatHoursMinutes,
  formatBalance,
} from "@/lib/time-calculations";

interface TimeEntryData {
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string | null;
}

interface WeeklyViewProps {
  initialEntries: TimeEntryData[];
  weeklyHours: number;
  initialDate: Date;
}

export function WeeklyView({
  initialEntries,
  weeklyHours,
  initialDate,
}: WeeklyViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [showWeekend, setShowWeekend] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(currentDate);
  const year = currentDate.getFullYear();

  const allDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const days = showWeekend
    ? allDays
    : allDays.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);

  // Calculate summary
  let totalWorked = 0;
  let totalTarget = 0;

  for (const day of days) {
    const dateStr = day.toISOString().split("T")[0];
    const entry = initialEntries.find(
      (e) => e.date.toISOString().split("T")[0] === dateStr
    );
    const target = getDailyTargetHours(day, weeklyHours);
    totalTarget += target;
    if (entry) {
      totalWorked += calculateWorkedHours(
        entry.startTime,
        entry.endTime,
        entry.breakMinutes
      );
    }
  }

  const totalBalance = totalWorked - totalTarget;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center font-medium">
            KW {weekNumber} / {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
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
            id="show-weekend"
            checked={showWeekend}
            onCheckedChange={setShowWeekend}
          />
          <Label htmlFor="show-weekend" className="text-sm">
            Wochenende
          </Label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Tag</TableHead>
              <TableHead className="w-16">Datum</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Ende</TableHead>
              <TableHead>Pause</TableHead>
              <TableHead className="text-right">Ist</TableHead>
              <TableHead className="text-right">Soll</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead>Notizen</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {days.map((day) => {
              const dateStr = day.toISOString().split("T")[0];
              const entry = initialEntries.find(
                (e) => e.date.toISOString().split("T")[0] === dateStr
              );
              const target = getDailyTargetHours(day, weeklyHours);

              return (
                <DayRow
                  key={dateStr}
                  date={day}
                  entry={entry}
                  targetHours={target}
                />
              );
            })}
            {/* Summary Row */}
            <TableRow className="border-t-2 font-semibold">
              <TableCell colSpan={5} className="text-right">
                Gesamt
              </TableCell>
              <TableCell className="font-mono text-right">
                {formatHoursMinutes(totalWorked)}
              </TableCell>
              <TableCell className="font-mono text-right text-muted-foreground">
                {formatHoursMinutes(totalTarget)}
              </TableCell>
              <TableCell
                className={`font-mono text-right ${
                  totalBalance >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatBalance(totalBalance)}
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        {format(weekStart, "dd. MMMM", { locale: de })} &ndash;{" "}
        {format(weekEnd, "dd. MMMM yyyy", { locale: de })}
      </p>
    </div>
  );
}
