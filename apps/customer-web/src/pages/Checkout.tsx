/**
 * Cart review and place order — pay at counter.
 */

import { useState } from "react";
import { placeOrder } from "../api/orders";
import { useCart } from "../context/CartContext";
import { colors, radius } from "../styles/tokens";

type Props = {
  tableCode: string;
  onTableCodeChange: (code: string) => void;
  customerName: string;
  onOrderPlaced: () => void;
};

export default function Checkout({ tableCode, onTableCodeChange, customerName, onOrderPlaced }: Props) {
  const { lines, setQty, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ orderCode: string } | null>(null);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0 || !tableCode.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const order = await placeOrder(
        tableCode.trim(),
        customerName,
        lines.map((l) => ({ name: l.name, price: l.price, qty: l.qty }))
      );
      clear();
      setDone({ orderCode: order.orderCode });
      onOrderPlaced();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden>
          &#10003;
        </div>
        <h2 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Order placed</h2>
        <p style={{ color: colors.slate500, marginBottom: 8 }}>Show this code at the counter to pay.</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: colors.teal600, letterSpacing: 1 }}>{done.orderCode}</p>
      </section>
    );
  }

  return (
    <section>
      <h2 style={{ fontSize: "1.1rem", marginBottom: 16, color: colors.slate900 }}>Checkout</h2>
      <p style={{ fontSize: 13, color: colors.slate500, marginBottom: 16 }}>Payment: pay at counter after your order is prepared.</p>

      <form onSubmit={handlePlaceOrder}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: colors.slate700 }}>
          Table code
        </label>
        <input
          value={tableCode}
          onChange={(e) => onTableCodeChange(e.target.value.toUpperCase())}
          placeholder="e.g. T-DEMO"
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: radius.md,
            border: `1px solid ${colors.slate200}`,
            marginBottom: 16,
            fontSize: 16,
            boxSizing: "border-box"
          }}
        />

        {lines.length === 0 ? (
          <p style={{ color: colors.slate500 }}>Your cart is empty. Add items from the Menu tab.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
            {lines.map((line) => (
              <li
                key={line.menuItemId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid ${colors.slate100}`
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{line.name}</div>
                  <div style={{ fontSize: 12, color: colors.slate500 }}>₹{line.price} each</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setQty(line.menuItemId, line.qty - 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: `1px solid ${colors.slate200}`,
                      background: colors.white,
                      cursor: "pointer"
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{line.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(line.menuItemId, line.qty + 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: `1px solid ${colors.slate200}`,
                      background: colors.white,
                      cursor: "pointer"
                    }}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p style={{ color: "#b91c1c", fontSize: 14, marginBottom: 12 }}>{error}</p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            fontSize: 16,
            fontWeight: 700
          }}
        >
          <span>Total</span>
          <span style={{ color: colors.teal600 }}>₹{subtotal.toFixed(0)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting || lines.length === 0}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: 16,
            fontWeight: 600,
            border: "none",
            borderRadius: radius.md,
            background: lines.length === 0 ? colors.slate200 : colors.teal600,
            color: colors.white,
            cursor: lines.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Placing…" : "Place order"}
        </button>
      </form>
    </section>
  );
}
