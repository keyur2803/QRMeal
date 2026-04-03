/**
 * Payment business logic.
 */

import * as paymentRepo from "../repositories/payment.repository.js";
import type { PaymentDto } from "../domain/types.js";

export async function recordCounterPayment(orderId: string, amount?: number): Promise<PaymentDto> {
  const order = await paymentRepo.findOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const payAmount = amount !== undefined ? amount : Number(order.totalAmount);
  const payment = await paymentRepo.upsertCounterPayment(orderId, payAmount);

  return {
    id: payment.id,
    orderId: payment.orderId,
    method: payment.method,
    amount: Number(payment.amount),
    status: payment.status.toLowerCase(),
    paidAt: payment.paidAt?.toISOString() ?? new Date().toISOString()
  };
}
