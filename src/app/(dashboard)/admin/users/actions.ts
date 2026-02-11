"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-utils";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function ensureAdminExists(excludeUserId?: string) {
  const count = await db.user.count({
    where: {
      role: "ADMIN",
      isActive: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
  if (count < 1) {
    throw new Error("Mindestens ein Admin muss existieren.");
  }
}

export async function getUsers() {
  await requireAdmin();
  return db.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      weeklyHours: true,
      vacationDaysPerYear: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function createUser(data: unknown) {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Ungueltige Eingabe" };
  }

  const { email, name, password, role, weeklyHours, vacationDaysPerYear } =
    parsed.data;

  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return { success: false as const, error: "E-Mail existiert bereits" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role,
      weeklyHours,
      vacationDaysPerYear,
    },
  });

  // Create vacation balance for current year
  const currentYear = new Date().getFullYear();
  await db.vacationBalance.create({
    data: {
      userId: user.id,
      year: currentYear,
      annualEntitlement: vacationDaysPerYear,
      carryOver: 0,
      correction: 0,
    },
  });

  revalidatePath("/admin/users");
  return { success: true as const };
}

export async function updateUser(data: unknown) {
  await requireAdmin();
  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Ungueltige Eingabe" };
  }

  const { id, ...updateData } = parsed.data;

  // Check admin protection if role change
  if (updateData.role === "USER") {
    const currentUser = await db.user.findUnique({ where: { id } });
    if (currentUser?.role === "ADMIN") {
      try {
        await ensureAdminExists(id);
      } catch {
        return {
          success: false as const,
          error: "Mindestens ein Admin muss existieren.",
        };
      }
    }
  }

  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase();
  }

  await db.user.update({ where: { id }, data: updateData });

  revalidatePath("/admin/users");
  return { success: true as const };
}

export async function deleteUser(id: string) {
  await requireAdmin();

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return { success: false as const, error: "Benutzer nicht gefunden" };
  }

  if (user.role === "ADMIN") {
    try {
      await ensureAdminExists(id);
    } catch {
      return {
        success: false as const,
        error: "Mindestens ein Admin muss existieren.",
      };
    }
  }

  // Soft delete
  await db.user.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/admin/users");
  return { success: true as const };
}
