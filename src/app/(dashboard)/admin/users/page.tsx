import { PageHeader } from "@/components/layout/page-header";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Benutzer"
        description="Benutzer verwalten"
      />
      <p className="text-muted-foreground">
        Benutzerverwaltung wird hier implementiert.
      </p>
    </div>
  );
}
