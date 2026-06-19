// Seed an initial MAIN_ADMIN so the portal can be accessed.
// Usage: node prisma/seed.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@wayamba.lk";
const ADMIN_PASSWORD = "Admin@123";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const user = await prisma.portalUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      fullName: "System Administrator",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "MAIN_ADMIN",
      mustChangePassword: false,
      admin: { create: {} },
    },
  });

  console.log("Seeded MAIN_ADMIN:");
  console.log("  email:   ", ADMIN_EMAIL);
  console.log("  password:", ADMIN_PASSWORD);
  console.log("  userId:  ", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
