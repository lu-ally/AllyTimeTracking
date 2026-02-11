import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("Admin-Benutzer existiert bereits. Seed wird uebersprungen.");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!",
    12
  );

  const admin = await prisma.user.create({
    data: {
      email: process.env.DEFAULT_ADMIN_EMAIL || "admin@allytimetracking.local",
      name: "Administrator",
      password: hashedPassword,
      role: "ADMIN",
      weeklyHours: 40,
      vacationDaysPerYear: 30,
    },
  });

  const currentYear = new Date().getFullYear();
  await prisma.vacationBalance.create({
    data: {
      userId: admin.id,
      year: currentYear,
      annualEntitlement: 30,
      carryOver: 0,
      correction: 0,
    },
  });

  console.log(`Standard-Admin erstellt: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
