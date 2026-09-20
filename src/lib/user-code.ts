import "server-only";
import { Prisma, type UserRole } from "@prisma/client";

export async function nextUserCode(
  tx: Prisma.TransactionClient,
  role: UserRole,
): Promise<string> {
  const sequence = role === "STUDENT" ? "student_user_code_seq" : "staff_user_code_seq";
  const rows = await tx.$queryRaw<{ value: bigint }[]>(
    Prisma.sql`SELECT nextval(${Prisma.raw(`'${sequence}'`)}::regclass) AS value`,
  );
  const number = Number(rows[0].value);
  const prefix = role === "STUDENT" ? "STU" : "STAFF";
  const width = role === "STUDENT" ? 4 : 3;
  return `${prefix}${String(number).padStart(width, "0")}`;
}