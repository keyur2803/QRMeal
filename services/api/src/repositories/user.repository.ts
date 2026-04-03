/**
 * User data access.
 * All Prisma queries for the User model live here.
 */

import { UserRole } from "../db/enums.js";
import { prisma } from "../db/prisma.js";

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findCustomerByPhone(phone: string) {
  return prisma.user.findFirst({
    where: { phone, role: UserRole.CUSTOMER, isActive: true }
  });
}

export function findByEmailAny(email: string) {
  return prisma.user.findFirst({ where: { email } });
}

export function createCustomer(data: { name: string; phone: string; email: string | null }) {
  return prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      passwordHash: null,
      role: UserRole.CUSTOMER
    }
  });
}
