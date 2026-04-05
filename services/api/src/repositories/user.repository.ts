/**
 * User data access.
 * All Prisma queries for the User model live here.
 */

import { UserRole } from "../db/enums.js";
import { prisma } from "../db/prisma.js";

export function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findCustomerByPhone(phone: string) {
  return prisma.user.findFirst({
    where: { phone, role: UserRole.CUSTOMER, isActive: true }
  });
}

export function findCustomerByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, role: UserRole.CUSTOMER, isActive: true }
  });
}

export function findByEmailAny(email: string) {
  return prisma.user.findFirst({ where: { email } });
}

export function createCustomer(data: { name: string; email: string; phone?: string | null }) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      passwordHash: null,
      role: UserRole.CUSTOMER
    }
  });
}
