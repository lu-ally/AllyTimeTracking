import { PageHeader } from "@/components/layout/page-header";
import { ReportsDashboard } from "@/components/admin/reports-dashboard";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Auswertung"
        description="Soll vs. Ist pro Mitarbeiter"
      />
      <ReportsDashboard />
    </div>
  );
}
