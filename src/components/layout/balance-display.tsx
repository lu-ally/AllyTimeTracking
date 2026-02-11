"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatBalance(hours: number): string {
  const sign = hours >= 0 ? "+" : "-";
  const absHours = Math.abs(hours);
  const h = Math.floor(absHours);
  const m = Math.round((absHours - h) * 60);
  return `${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function BalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const res = await fetch("/api/balance");
        if (res.ok) {
          const data = await res.json();
          setBalance(data.balance);
        }
      } catch {
        // Silently fail - balance will show as loading
      }
    }
    fetchBalance();
  }, []);

  if (balance === null) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>--:--</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-sm font-medium ${
        balance >= 0 ? "text-emerald-600" : "text-red-600"
      }`}
    >
      <Clock className="h-4 w-4" />
      <span>Saldo: {formatBalance(balance)}</span>
    </div>
  );
}
