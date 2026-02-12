import { PageHeader } from "@/components/layout/page-header";
import { UserTable } from "@/components/admin/user-table";
import { CreateUserDialog } from "@/components/admin/user-form";
import { getUsers } from "./actions";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <PageHeader title="Benutzer" description="Benutzer verwalten">
        <CreateUserDialog />
      </PageHeader>
      <UserTable users={users} />
    </div>
  );
}
