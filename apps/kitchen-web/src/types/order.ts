/** Kitchen-relevant order types. */

export type KitchenStatus = "pending" | "preparing" | "ready";

export type OrderItem = {
  name: string;
  qty: number;
  mod?: string;
};

export type KitchenOrder = {
  id: string;
  orderCode: string;
  table: string;
  status: KitchenStatus;
  createdAt: string;
  items: OrderItem[];
  note?: string;
};

export type KitchenBoard = {
  pending: KitchenOrder[];
  preparing: KitchenOrder[];
  ready: KitchenOrder[];
};
