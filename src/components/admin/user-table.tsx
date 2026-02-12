"use client";

import { Trash2, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateUser, deleteUser } from "@/app/(dashboard)/admin/users/actions";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  weeklyHours: number;
  vacationDaysPerYear: number;
  isActive: boolean;
  createdAt: Date;
}

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  async function handleToggleRole(user: User) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    const result = await updateUser({ id: user.id, role: newRole });
    if (result.success) {
      toast.success(`Rolle geaendert zu ${newRole === "ADMIN" ? "Admin" : "Benutzer"}`);
    } else {
      toast.error(result.error || "Fehler beim Aendern");
    }
  }

  async function handleDelete(user: User) {
    const result = await deleteUser(user.id);
    if (result.success) {
      toast.success("Benutzer deaktiviert");
    } else {
      toast.error(result.error || "Fehler beim Loeschen");
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Rolle</TableHead>
            <TableHead className="text-right">Wochenstunden</TableHead>
            <TableHead className="text-right">Urlaubstage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role === "ADMIN" ? "Admin" : "Benutzer"}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {user.weeklyHours}
              </TableCell>
              <TableCell className="text-right font-mono">
                {user.vacationDaysPerYear}
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "outline" : "destructive"}>
                  {user.isActive ? "Aktiv" : "Inaktiv"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleToggleRole(user)}
                    title={
                      user.role === "ADMIN"
                        ? "Zu Benutzer aendern"
                        : "Zu Admin aendern"
                    }
                  >
                    {user.role === "ADMIN" ? (
                      <ShieldOff className="h-3.5 w-3.5" />
                    ) : (
                      <Shield className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  {user.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(user)}
                      title="Deaktivieren"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
