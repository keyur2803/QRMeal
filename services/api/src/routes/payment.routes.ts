/**
 * Payment endpoints.
 *
 * POST /payments/counter — record a counter (cash) payment for an order
 */

import { Router } from "express";
import * as paymentService from "../services/payment.service.js";

export const paymentsRouter = Router();

paymentsRouter.post("/counter", async (req, res) => {
  const { orderId, amount } = req.body as { orderId?: string; amount?: number };

  if (!orderId) {
    return res.status(400).json({ message: "orderId required" });
  }

  try {
    const payment = await paymentService.recordCounterPayment(orderId, amount);
    return res.json(payment);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment failed";
    return res.status(404).json({ message: msg });
  }
});
