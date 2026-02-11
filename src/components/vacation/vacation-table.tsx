"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { deleteVacationEntry } from "@/app/(dashboard)/vacation/actions";
import { calculateVacationDays } from "@/lib/vacation-calculations";
import { toast } from "sonner";

interface VacationEntry {
  id: string;
  startDate: Date;
  endDate: Date;
  halfDayStart: boolean;
  halfDayEnd: boolean;
  status: string;
  notes: string | null;
}

interface VacationTableProps {
  entries: VacationEntry[];
}

export function VacationTable({ entries }: VacationTableProps) {
  async function handleDelete(id: string) {
    const result = await deleteVacationEntry(id);
    if (result.success) {
      toast.success("Urlaubseintrag geloescht");
    } else {
      toast.error(result.error || "Fehler beim Loeschen");
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Urlaubseintraege vorhanden.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zeitraum</TableHead>
            <TableHead>Tage</TableHead>
            <TableHead>Halbtag</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notizen</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const days = calculateVacationDays(
              entry.startDate,
              entry.endDate,
              entry.halfDayStart,
              entry.halfDayEnd
            );

            return (
              <TableRow key={entry.id}>
                <TableCell>
                  {format(entry.startDate, "dd.MM.yyyy", { locale: de })}
                  {" - "}
                  {format(entry.endDate, "dd.MM.yyyy", { locale: de })}
                </TableCell>
                <TableCell className="font-mono">{days}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {entry.halfDayStart && "Erster Tag halber Tag"}
                  {entry.halfDayStart && entry.halfDayEnd && ", "}
                  {entry.halfDayEnd && "Letzter Tag halber Tag"}
                  {!entry.halfDayStart && !entry.halfDayEnd && "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      entry.status === "APPROVED"
                        ? "default"
                        : entry.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {entry.status === "APPROVED"
                      ? "Genehmigt"
                      : entry.status === "REJECTED"
                        ? "Abgelehnt"
                        : "Ausstehend"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.notes || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
