/**
 * Payment data access.
 */

import { PaymentStatus } from "../db/enums.js";
import { prisma } from "../db/prisma.js";

export function findOrderById(orderId: string) {
  return prisma.order.findUnique({ where: { id: orderId } });
}

export function upsertCounterPayment(orderId: string, amount: number) {
  const paidAt = new Date();
  return prisma.payment.upsert({
    where: { orderId },
    create: { orderId, amount, method: "COUNTER", status: PaymentStatus.SUCCESS, paidAt },
    update: { amount, status: PaymentStatus.SUCCESS, paidAt }
  });
}
