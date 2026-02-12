"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { TimeInput } from "./time-input";
import {
  calculateWorkedHours,
  formatHoursMinutes,
  formatBalance,
} from "@/lib/time-calculations";
import { isPublicHoliday, type PublicHoliday } from "@/lib/holidays";
import { upsertTimeEntry, deleteTimeEntry } from "@/app/(dashboard)/time-tracking/actions";
import { toast } from "sonner";

interface DayRowProps {
  date: Date;
  entry?: {
    startTime: string;
    endTime: string;
    breakMinutes: number;
    notes: string | null;
  };
  targetHours: number;
}

export function DayRow({ date, entry, targetHours }: DayRowProps) {
  const [startTime, setStartTime] = useState(entry?.startTime ?? "");
  const [endTime, setEndTime] = useState(entry?.endTime ?? "");
  const [breakMinutes, setBreakMinutes] = useState(
    entry?.breakMinutes?.toString() ?? ""
  );
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const holiday: PublicHoliday | undefined = isPublicHoliday(date);
  const isHolidayDay = !!holiday;
  const hasEntry = !!entry;

  const dateStr = format(date, "yyyy-MM-dd");
  const dayName = format(date, "EEE", { locale: de });
  const dateDisplay = format(date, "dd.MM.", { locale: de });

  const worked =
    startTime && endTime
      ? calculateWorkedHours(startTime, endTime, parseInt(breakMinutes) || 0)
      : 0;
  const balance = worked - targetHours;

  async function handleSave() {
    if (!startTime || !endTime) return;
    if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) return;
    setIsSaving(true);
    const result = await upsertTimeEntry({
      date: dateStr,
      startTime,
      endTime,
      breakMinutes: parseInt(breakMinutes) || 0,
      notes: notes || undefined,
    });
    setIsSaving(false);
    if (result.success) {
      toast.success("Eintrag gespeichert");
    } else {
      toast.error(result.error || "Fehler beim Speichern");
    }
  }

  async function handleDelete() {
    if (!hasEntry) return;
    setIsSaving(true);
    await deleteTimeEntry(dateStr);
    setStartTime("");
    setEndTime("");
    setBreakMinutes("");
    setNotes("");
    setIsSaving(false);
    toast.success("Eintrag geloescht");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setStartTime(entry?.startTime ?? "");
      setEndTime(entry?.endTime ?? "");
      setBreakMinutes(entry?.breakMinutes?.toString() ?? "");
      setNotes(entry?.notes ?? "");
    }
  }

  const rowClass = isHolidayDay
    ? "bg-blue-50/50"
    : isWeekend
      ? "bg-muted/30"
      : hasEntry
        ? "bg-emerald-50/30"
        : "";

  return (
    <TableRow className={rowClass}>
      <TableCell className="font-medium w-12">
        <span className="capitalize">{dayName}</span>
      </TableCell>
      <TableCell className="w-16 text-muted-foreground">{dateDisplay}</TableCell>
      <TableCell>
        <TimeInput
          value={startTime}
          onChange={setStartTime}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
        />
      </TableCell>
      <TableCell>
        <TimeInput
          value={endTime}
          onChange={setEndTime}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          value={breakMinutes}
          onChange={(e) => setBreakMinutes(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="0"
          disabled={isSaving}
          className="w-16 text-center font-mono"
        />
      </TableCell>
      <TableCell className="font-mono text-right">
        {worked > 0 ? formatHoursMinutes(worked) : "--:--"}
      </TableCell>
      <TableCell className="font-mono text-right text-muted-foreground">
        {isHolidayDay ? (
          <span className="text-xs text-blue-600" title={holiday.name}>
            {holiday.name}
          </span>
        ) : (
          formatHoursMinutes(targetHours)
        )}
      </TableCell>
      <TableCell
        className={`font-mono text-right ${
          balance > 0
            ? "text-emerald-600"
            : balance < 0 && targetHours > 0
              ? "text-red-600"
              : ""
        }`}
      >
        {targetHours > 0 || worked > 0 ? formatBalance(balance) : ""}
      </TableCell>
      <TableCell>
        <Input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          placeholder="Notizen"
          disabled={isSaving}
          className="w-32"
        />
      </TableCell>
      <TableCell className="w-8">
        {hasEntry && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
