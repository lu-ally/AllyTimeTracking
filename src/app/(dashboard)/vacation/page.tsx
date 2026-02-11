import { requireAuth } from "@/lib/auth-utils";
import { PageHeader } from "@/components/layout/page-header";
import { VacationBalanceCard } from "@/components/vacation/balance-card";
import { VacationForm } from "@/components/vacation/vacation-form";
import { VacationTable } from "@/components/vacation/vacation-table";
import { getVacationSummary } from "./actions";

export default async function VacationPage() {
  const session = await requireAuth();
  const year = new Date().getFullYear();
  const summary = await getVacationSummary(session.user.id, year);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Urlaub"
        description="Verwalten Sie Ihre Urlaubstage"
      />

      <VacationBalanceCard
        annualEntitlement={summary.annualEntitlement}
        carryOver={summary.carryOver}
        correction={summary.correction}
        totalEntitlement={summary.totalEntitlement}
        usedDays={summary.usedDays}
        remaining={summary.remaining}
      />

      <VacationForm />

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Ihre Urlaubseintraege</h2>
        <VacationTable entries={summary.entries} />
      </div>
    </div>
  );
}
