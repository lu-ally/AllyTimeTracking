import { PageHeader } from "@/components/layout/page-header";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Auswertung"
        description="Berichte und Exporte"
      />
      <p className="text-muted-foreground">
        Auswertungs-Dashboard wird hier implementiert.
      </p>
    </div>
  );
}
