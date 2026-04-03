/**
 * Order data access.
 * Complex queries and transactions for the Order aggregate.
 */

import type { Prisma } from "@prisma/client";
import { OrderStatus } from "../db/enums.js";
import { prisma } from "../db/prisma.js";
import type { OrderWithRelations } from "../domain/serializers.js";

/** Standard includes when loading an order with all relations. */
const INCLUDE = {
  items: true,
  table: true,
  statusHistory: { orderBy: { changedAt: "asc" as const } }
} as const;

export function findAll(): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({ include: INCLUDE, orderBy: { createdAt: "desc" } });
}

export function findByActiveStatuses(): Promise<OrderWithRelations[]> {
  return prisma.order.findMany({
    where: { status: { in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY] } },
    include: INCLUDE,
    orderBy: { createdAt: "asc" }
  });
}

export function findByOrderCode(orderCode: string) {
  return prisma.order.findUnique({ where: { orderCode } });
}

type CreateOrderInput = {
  orderCode: string;
  tableId: string;
  customerName: string;
  totalAmount: number;
  items: { itemName: string; qty: number; unitPrice: number }[];
};

export function createOrder(input: CreateOrderInput): Promise<OrderWithRelations> {
  return prisma.order.create({
    data: {
      orderCode: input.orderCode,
      tableId: input.tableId,
      customerName: input.customerName,
      status: OrderStatus.PENDING,
      totalAmount: input.totalAmount,
      paymentMode: "COUNTER",
      items: { create: input.items },
      statusHistory: {
        create: { toStatus: OrderStatus.PENDING, changedBy: "system" }
      }
    },
    include: INCLUDE
  });
}

/** Transition status inside a transaction and log history. */
export async function updateStatus(
  orderId: string,
  nextStatus: OrderStatus,
  changedBy: string
): Promise<OrderWithRelations | null> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const current = await tx.order.findUnique({ where: { id: orderId }, include: INCLUDE });
    if (!current) return null;

    await tx.order.update({ where: { id: orderId }, data: { status: nextStatus } });

    await tx.orderStatusHistory.create({
      data: { orderId, fromStatus: current.status, toStatus: nextStatus, changedBy }
    });

    return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: INCLUDE });
  });
}
