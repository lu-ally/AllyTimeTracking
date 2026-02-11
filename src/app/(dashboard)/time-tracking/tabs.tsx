"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyView } from "@/components/time-tracking/weekly-view";
import { MonthlyView } from "@/components/time-tracking/monthly-view";

interface TimeEntryData {
  date: Date;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes: string | null;
}

interface TimeTrackingTabsProps {
  entries: TimeEntryData[];
  weeklyHours: number;
  initialDate: Date;
}

export function TimeTrackingTabs({
  entries,
  weeklyHours,
  initialDate,
}: TimeTrackingTabsProps) {
  return (
    <Tabs defaultValue="weekly">
      <TabsList>
        <TabsTrigger value="weekly">Wochenansicht</TabsTrigger>
        <TabsTrigger value="monthly">Monatsansicht</TabsTrigger>
      </TabsList>
      <TabsContent value="weekly" className="mt-4">
        <WeeklyView
          initialEntries={entries}
          weeklyHours={weeklyHours}
          initialDate={initialDate}
        />
      </TabsContent>
      <TabsContent value="monthly" className="mt-4">
        <MonthlyView
          initialEntries={entries}
          weeklyHours={weeklyHours}
          initialDate={initialDate}
        />
      </TabsContent>
    </Tabs>
  );
}
