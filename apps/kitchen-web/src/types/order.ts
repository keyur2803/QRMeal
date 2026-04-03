/** Kitchen-relevant order types. */

export type KitchenStatus = "pending" | "preparing" | "ready";

export type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

export type KitchenOrder = {
  id: string;
  orderCode: string;
  table: string;
  customerName: string;
  items: OrderItem[];
  status: KitchenStatus;
  createdAt: string;
};

export type KitchenBoard = {
  pending: KitchenOrder[];
  preparing: KitchenOrder[];
  ready: KitchenOrder[];
};
