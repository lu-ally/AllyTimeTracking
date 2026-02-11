import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Ungueltige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const createUserSchema = z.object({
  email: z.email("Ungueltige E-Mail-Adresse"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  role: z.enum(["USER", "ADMIN"]),
  weeklyHours: z.number().min(0).max(60).default(40),
  vacationDaysPerYear: z.number().min(0).max(50).default(30),
});

export const updateUserSchema = z.object({
  id: z.string(),
  email: z.email("Ungueltige E-Mail-Adresse").optional(),
  name: z.string().min(2).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  weeklyHours: z.number().min(0).max(60).optional(),
  vacationDaysPerYear: z.number().min(0).max(50).optional(),
  isActive: z.boolean().optional(),
});

export const timeEntrySchema = z
  .object({
    date: z.string(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:mm"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:mm"),
    breakMinutes: z.number().min(0, "Pause kann nicht negativ sein").default(0),
    notes: z.string().optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Endzeit muss nach Startzeit liegen",
    path: ["endTime"],
  });

export const vacationEntrySchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
    halfDayStart: z.boolean().default(false),
    halfDayEnd: z.boolean().default(false),
    notes: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Enddatum muss nach oder am Startdatum liegen",
    path: ["endDate"],
  });

export const vacationBalanceSchema = z.object({
  userId: z.string(),
  year: z.number().int(),
  annualEntitlement: z.number().min(0),
  carryOver: z.number(),
  correction: z.number(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;
export type VacationEntryInput = z.infer<typeof vacationEntrySchema>;
export type VacationBalanceInput = z.infer<typeof vacationBalanceSchema>;
