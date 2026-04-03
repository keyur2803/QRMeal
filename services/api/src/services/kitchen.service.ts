/**
 * Kitchen board business logic.
 * Returns active orders grouped by lane (pending / preparing / ready).
 */

import * as orderRepo from "../repositories/order.repository.js";
import { serializeOrder } from "../domain/serializers.js";
import type { OrderDto } from "../domain/types.js";

type KitchenBoard = {
  pending: OrderDto[];
  preparing: OrderDto[];
  ready: OrderDto[];
};

export async function getBoard(): Promise<KitchenBoard> {
  const rows = await orderRepo.findByActiveStatuses();
  const all = rows.map(serializeOrder);

  return {
    pending: all.filter((o) => o.status === "pending"),
    preparing: all.filter((o) => o.status === "preparing"),
    ready: all.filter((o) => o.status === "ready")
  };
}
