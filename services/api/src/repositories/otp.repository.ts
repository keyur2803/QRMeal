import { prisma } from "../db/prisma.js";

export async function createOtp(email: string, code: string, expiresAt: Date) {
  // Delete any existing codes for this email to avoid clutter
  await prisma.verificationCode.deleteMany({ where: { email } });

  return prisma.verificationCode.create({
    data: {
      email,
      code,
      expiresAt
    }
  });
}

export async function findLatestOtp(email: string) {
  return prisma.verificationCode.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" }
  });
}

export async function deleteOtp(id: string) {
  return prisma.verificationCode.delete({ where: { id } });
}

export async function deleteExpiredOtps() {
  return prisma.verificationCode.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
}
