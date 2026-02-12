"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createUser } from "@/app/(dashboard)/admin/users/actions";
import { generatePassword } from "@/lib/password-generator";
import { toast } from "sonner";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [vacationDays, setVacationDays] = useState("30");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleGeneratePassword() {
    setPassword(generatePassword());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await createUser({
      name,
      email,
      password,
      role,
      weeklyHours: parseFloat(weeklyHours),
      vacationDaysPerYear: parseFloat(vacationDays),
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Benutzer erstellt");
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("USER");
      setWeeklyHours("40");
      setVacationDays("30");
    } else {
      toast.error(result.error || "Fehler beim Erstellen");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Benutzer anlegen</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Name</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">E-Mail</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">Passwort</Label>
            <div className="flex gap-2">
              <Input
                id="user-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="flex-1 font-mono"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGeneratePassword}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Passwort generieren</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Rolle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "USER" | "ADMIN")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">Benutzer</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekly-hours">Wochenstunden</Label>
              <Input
                id="weekly-hours"
                type="number"
                min="0"
                max="60"
                step="0.5"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vacation-days">Urlaubstage / Jahr</Label>
              <Input
                id="vacation-days"
                type="number"
                min="0"
                max="50"
                value={vacationDays}
                onChange={(e) => setVacationDays(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Erstellen..." : "Erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
