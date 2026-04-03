/**
 * Single order ticket displayed on the kitchen Kanban board.
 */

import type { KitchenOrder, KitchenStatus } from "../types/order";

type Props = {
  order: KitchenOrder;
  onMove: (orderId: string, next: KitchenStatus) => void;
};

const ACTION: Record<KitchenStatus, { label: string; next: KitchenStatus } | null> = {
  pending: { label: "Start Cooking", next: "preparing" },
  preparing: { label: "Mark Ready", next: "ready" },
  ready: null
};

export default function OrderCard({ order, onMove }: Props) {
  const action = ACTION[order.status];

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <strong>{order.table}</strong>
        <span style={{ fontSize: 12, color: "#64748b" }}>#{order.orderCode}</span>
      </div>

      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#334155" }}>
        {order.items.map((item, i) => (
          <li key={i}>
            {item.name} &times; {item.qty}
          </li>
        ))}
      </ul>

      {action && (
        <button
          type="button"
          onClick={() => onMove(order.id, action.next)}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "8px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            border: "none",
            background: order.status === "pending" ? "#0d9488" : "#f59e0b",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          {action.label}
        </button>
      )}
    </article>
  );
}
