import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceCardProps {
  annualEntitlement: number;
  carryOver: number;
  correction: number;
  totalEntitlement: number;
  usedDays: number;
  remaining: number;
}

export function VacationBalanceCard({
  annualEntitlement,
  carryOver,
  correction,
  totalEntitlement,
  usedDays,
  remaining,
}: BalanceCardProps) {
  const percentage = totalEntitlement > 0 ? (usedDays / totalEntitlement) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Urlaubskonto {new Date().getFullYear()}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Jahresanspruch</p>
            <p className="text-lg font-semibold">{annualEntitlement} Tage</p>
          </div>
          <div>
            <p className="text-muted-foreground">Uebertrag</p>
            <p className="text-lg font-semibold">{carryOver} Tage</p>
          </div>
          <div>
            <p className="text-muted-foreground">Korrektur</p>
            <p className="text-lg font-semibold">{correction} Tage</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {usedDays} von {totalEntitlement} Tagen verbraucht
            </span>
            <span className="font-medium">
              {remaining} Tage verbleibend
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all ${
                percentage > 90
                  ? "bg-red-500"
                  : percentage > 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
