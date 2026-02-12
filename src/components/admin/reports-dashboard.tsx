"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatHoursMinutes,
  formatBalance,
} from "@/lib/time-calculations";
import { getMonthlyReport } from "@/app/(dashboard)/admin/reports/actions";

interface UserReport {
  userId: string;
  userName: string;
  userEmail: string;
  targetHours: number;
  actualHours: number;
  monthBalance: number;
  totalBalance: number;
}

export function ReportsDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getMonthlyReport(year, month);
      setReports(data);
      setIsLoading(false);
    }
    load();
  }, [year, month]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 2, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month, 1));
  }

  function handleExport() {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
    window.open(`/api/admin/export?startDate=${startDate}&endDate=${endDate}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center font-medium">
            {format(currentDate, "MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          CSV Export
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead className="text-right">Soll (Monat)</TableHead>
                <TableHead className="text-right">Ist (Monat)</TableHead>
                <TableHead className="text-right">Saldo (Monat)</TableHead>
                <TableHead className="text-right">
                  Laufender Saldo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.userId}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {report.userEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatHoursMinutes(report.targetHours)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatHoursMinutes(report.actualHours)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono ${
                      report.monthBalance >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatBalance(report.monthBalance)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono font-semibold ${
                      report.totalBalance >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatBalance(report.totalBalance)}
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Keine Daten vorhanden
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
