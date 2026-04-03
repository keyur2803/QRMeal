/**
 * Kitchen Kanban board — three-lane display of active orders.
 * Auto-polls the API; kitchen staff can transition orders via buttons.
 */

import { useKitchenBoard } from "../hooks/useKitchenBoard";
import OrderCard from "../components/OrderCard";
import type { KitchenStatus } from "../types/order";

const LANES: { key: KitchenStatus; label: string; color: string }[] = [
  { key: "pending", label: "Pending", color: "#fbbf24" },
  { key: "preparing", label: "Preparing", color: "#0d9488" },
  { key: "ready", label: "Ready", color: "#10b981" }
];

export default function KitchenBoard() {
  const { board, error, move } = useKitchenBoard();

  return (
    <main>
      <h1 style={{ fontSize: "1.3rem", marginBottom: 16 }}>Kitchen Board</h1>
      {error && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 16 }}>
        {LANES.map(({ key, label, color }) => (
          <section key={key} style={{ flex: 1 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 10 }}>
              {label} ({board[key].length})
            </h2>
            {board[key].map((order) => (
              <OrderCard key={order.id} order={order} onMove={move} />
            ))}
            {board[key].length === 0 && (
              <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>No orders</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
