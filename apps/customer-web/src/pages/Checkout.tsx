/**
 * Cart review and place order — pay at counter.
 */

import { useState } from "react";
import { placeOrder, type PlacedOrder } from "../api/orders";
import { useCart } from "../context/CartContext";
import { menuImageSrc } from "../lib/imageUrl";
import { Plus, Minus } from "lucide-react";
import { colors, radius, shadowSm } from "../styles/tokens";
import Header from "../components/Header";

type Props = {
  tableCode: string;
  customerName: string;
  onBack: () => void;
  onAddMore: () => void;
  onOrderPlaced: (order: PlacedOrder) => void;
};

const shadowXs = "0 1px 2px rgba(0,0,0,0.05)";

export default function Checkout({ tableCode, customerName, onBack, onAddMore, onOrderPlaced }: Props) {
  const { lines, setQty, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onOrderPlaced(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  }

  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div style={{ background: colors.slate50, minHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column" }}>
      <Header title="Your Order" tableCode={tableCode} onBack={onBack} />

      <form onSubmit={handlePlaceOrder}>
        <div style={{ padding: "20px 16px 180px" }}>
          {lines.length === 0 ? (
            <div style={{ paddingTop: 24, color: colors.slate500, textAlign: "center" }}>Your cart is empty.</div>
          ) : (
            <>
              {lines.map((line) => (
                <div
                  key={line.menuItemId}
                    style={{
                      background: colors.white,
                      borderRadius: radius.lg,
                      padding: 16,
                      marginBottom: 12,
                      display: "flex",
                      gap: 16,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: radius.md,
                      flexShrink: 0,
                      background: `linear-gradient(135deg, ${colors.teal50}, ${colors.teal100})`,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26
                    }}
                  >
                    {menuImageSrc(line.imageUrl) ? (
                      <img src={menuImageSrc(line.imageUrl)!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "🍽️"
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, color: colors.slate900 }}>{line.name}</div>
                    <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 8 }}>Table {tableCode}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: colors.teal600 }}>₹{(line.price * line.qty).toFixed(0)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => setQty(line.menuItemId, line.qty - 1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: radius.sm,
                            border: `1.5px solid ${colors.slate200}`,
                            background: colors.white,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.slate600,
                            padding: 0
                          }}
                        >
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 800, minWidth: 16, textAlign: "center" }}>{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.menuItemId, line.qty + 1)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: radius.sm,
                            border: `1.5px solid ${colors.slate200}`,
                            background: colors.white,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: colors.slate600,
                            padding: 0
                          }}
                        >
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: 480,
            margin: "0 auto",
            background: colors.white,
            borderRadius: `${radius.lg}px ${radius.lg}px 0 0`,
            padding: "24px 20px 32px",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
            borderTop: `1px solid ${colors.slate100}`
          }}
        >
          {error && (
            <div style={{ color: "#b91c1c", fontSize: 13, marginBottom: 10, background: "#fef2f2", padding: "10px 12px", borderRadius: radius.md }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={onAddMore}
            style={{
              width: "100%",
              border: `1.5px dashed ${colors.teal500}`,
              borderRadius: radius.lg,
              padding: 14,
              background: `linear-gradient(135deg, ${colors.teal50}, #f5f3ff)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              marginBottom: 14
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                background: colors.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.teal600,
                boxShadow: shadowSm,
                flexShrink: 0
              }}
            >
              <Plus size={20} strokeWidth={3} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.teal700 }}>Add More Items</div>
              <div style={{ fontSize: 12, color: colors.slate500, marginTop: 2 }}>Browse menu for extras & drinks</div>
            </div>
          </button>

          <div style={{ paddingTop: 16, borderTop: `1px solid ${colors.slate100}`, marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: colors.slate500 }}>Subtotal</span>
              <span style={{ color: colors.slate900, fontWeight: 700 }}>₹{subtotal.toFixed(0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, fontSize: 20 }}>
              <span style={{ fontWeight: 800, color: colors.slate900 }}>Total Amount</span>
              <span style={{ fontWeight: 900, color: colors.teal600 }}>₹{subtotal.toFixed(0)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || lines.length === 0}
            style={{
              width: "100%",
              padding: "18px",
              fontSize: 16,
              fontWeight: 800,
              border: "none",
              borderRadius: radius.lg,
              background: lines.length === 0 ? colors.slate200 : colors.teal600,
              color: colors.white,
              cursor: submitting || lines.length === 0 ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Placing…" : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
