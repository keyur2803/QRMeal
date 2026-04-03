/** Order summary for the admin dashboard. */
export type OrderSummary = {
  id: string;
  orderCode: string;
  table: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
};
