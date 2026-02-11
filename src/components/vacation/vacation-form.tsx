"use client";

import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createVacationEntry } from "@/app/(dashboard)/vacation/actions";
import { calculateVacationDays } from "@/lib/vacation-calculations";
import { toast } from "sonner";

export function VacationForm() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [halfDayStart, setHalfDayStart] = useState(false);
  const [halfDayEnd, setHalfDayEnd] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewDays =
    startDate && endDate
      ? calculateVacationDays(startDate, endDate, halfDayStart, halfDayEnd)
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setIsSubmitting(true);
    const result = await createVacationEntry({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      halfDayStart,
      halfDayEnd,
      notes: notes || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Urlaub eingetragen");
      setStartDate(undefined);
      setEndDate(undefined);
      setHalfDayStart(false);
      setHalfDayEnd(false);
      setNotes("");
    } else {
      toast.error(result.error || "Fehler beim Speichern");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Neuen Urlaub eintragen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Von</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "dd.MM.yyyy", { locale: de })
                      : "Datum waehlen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="half-start"
                  checked={halfDayStart}
                  onCheckedChange={(c) => setHalfDayStart(c === true)}
                />
                <Label htmlFor="half-start" className="text-sm">
                  Halber Tag
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bis</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? format(endDate, "dd.MM.yyyy", { locale: de })
                      : "Datum waehlen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={de}
                    disabled={(date) =>
                      startDate ? date < startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="half-end"
                  checked={halfDayEnd}
                  onCheckedChange={(c) => setHalfDayEnd(c === true)}
                />
                <Label htmlFor="half-end" className="text-sm">
                  Halber Tag
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacation-notes">Notizen</Label>
            <Input
              id="vacation-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionale Notizen"
            />
          </div>

          {previewDays > 0 && (
            <p className="text-sm text-muted-foreground">
              Dieser Eintrag verbraucht{" "}
              <span className="font-semibold text-foreground">
                {previewDays} Urlaubstag{previewDays !== 1 ? "e" : ""}
              </span>
            </p>
          )}

          <Button type="submit" disabled={isSubmitting || !startDate || !endDate}>
            {isSubmitting ? "Speichern..." : "Urlaub eintragen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
