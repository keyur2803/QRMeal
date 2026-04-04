import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "../api/menu";
import { addItemsToOrder, fetchOrders, type OrderDto } from "../api/orders";
import { colors, radius, shadowSm } from "../styles/tokens";
import type { MenuItem } from "../types/menu";
import { menuImageSrc } from "../lib/imageUrl";

type Props = {
  orderId: string;
  orderCode: string;
  onBack: () => void;
  onDone: () => void;
};

type AddLine = { id: string; name: string; price: number; imageUrl: string | null; qty: number };

export default function AddMore({ orderId, orderCode, onBack, onDone }: Props) {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<AddLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [m, orders] = await Promise.all([fetchMenu(), fetchOrders()]);
        if (cancelled) return;
        setItems(m);
        setOrder(orders.find((o) => o.id === orderId) ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (!i.isAvailable) return false;
      if (q && !(`${i.name} ${i.description ?? ""} ${i.category}`.toLowerCase().includes(q))) return false;
      if (cat === "All") return true;
      return i.category === cat;
    });
  }, [items, search, cat]);

  const addCount = lines.reduce((s, l) => s + l.qty, 0);
  const addTotal = lines.reduce((s, l) => s + l.price * l.qty, 0);

  function inc(item: MenuItem) {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === item.id);
      if (i === -1) return [...prev, { id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, qty: 1 }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + 1 };
      return next;
    });
  }

  function dec(itemId: string) {
    setLines((prev) => {
      const current = prev.find((l) => l.id === itemId);
      if (!current) return prev;
      if (current.qty <= 1) return prev.filter((l) => l.id !== itemId);
      return prev.map((l) => (l.id === itemId ? { ...l, qty: l.qty - 1 } : l));
    });
  }

  async function handleAdd() {
    if (lines.length === 0) return;
    setError(null);
    setSubmitting(true);
    try {
      await addItemsToOrder(
        orderId,
        lines.map((l) => ({ name: l.name, price: l.price, qty: l.qty }))
      );
      setLines([]);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add items");
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabel =
    order?.status === "pending"
      ? "Order placed"
      : order?.status === "preparing"
        ? "Being prepared"
        : order?.status === "ready"
          ? "Ready"
          : order?.status === "served"
            ? "Served"
            : "Active";

  const recommended = useMemo(() => {
    const picks = items.filter((i) => i.isAvailable).slice(0, 6);
    return picks.slice(0, 4);
  }, [items]);

  return (
    <div style={{ margin: "0 -16px", background: colors.slate50, minHeight: "calc(100vh - 32px)" }}>
      <div style={{ background: colors.white, padding: "14px 16px", borderBottom: `1px solid ${colors.slate100}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <button type="button" onClick={onBack} style={{ padding: 0, border: "none", background: "none", fontSize: 20, cursor: "pointer", color: colors.slate600 }}>
            ←
          </button>
          <div style={{ flex: 1, fontSize: 18, fontWeight: 800, color: colors.slate900 }}>Add to Order</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: colors.green500, color: colors.white, padding: "5px 12px", borderRadius: radius.full, fontSize: 11, fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.white }} />
            Live Order
          </div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${colors.teal50}, #f5f3ff)`, borderRadius: radius.md, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: colors.slate500, marginBottom: 2 }}>Current Order #{orderCode}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{order ? `${order.items.length} items · ${statusLabel}` : "Loading..."}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: colors.teal600 }}>₹{(order?.total ?? 0).toFixed(0)}</div>
        </div>
      </div>

      <div style={{ padding: "16px 16px 120px" }}>
        {error && (
          <div style={{ color: "#b91c1c", background: "#fef2f2", padding: 12, borderRadius: radius.md, marginBottom: 12 }}>
            {error}
          </div>
        )}
        {loading ? (
          <div style={{ color: colors.slate500 }}>Loading…</div>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 800, color: colors.slate400, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              ✨ Recommended with your order
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {recommended.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => inc(r)}
                  style={{
                    minWidth: 120,
                    background: colors.white,
                    borderRadius: radius.lg,
                    padding: "14px 12px",
                    textAlign: "center",
                    boxShadow: shadowSm,
                    flexShrink: 0,
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  <div style={{ width: 64, height: 64, margin: "0 auto 10px", borderRadius: radius.md, overflow: "hidden", background: colors.slate100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {menuImageSrc(r.imageUrl) ? (
                      <img src={menuImageSrc(r.imageUrl)!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "🍽️"
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: colors.slate900 }}>{r.name}</div>
                  <div style={{ fontSize: 13, color: colors.teal600, fontWeight: 800 }}>₹{r.price.toFixed(0)}</div>
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: colors.teal600, background: colors.teal50, padding: "4px 10px", borderRadius: radius.full, display: "inline-block" }}>
                    + Add
                  </div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, color: colors.slate400, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Browse Full Menu
            </div>

            <div style={{ display: "flex", gap: 10, background: colors.slate100, borderRadius: radius.md, padding: "12px 16px", marginBottom: 14 }}>
              <span style={{ color: colors.slate400 }} aria-hidden>
                🔎
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, color: colors.slate700 }}
              />
            </div>

            <div style={{ marginBottom: 16, overflowX: "auto" }}>
              <div style={{ display: "flex", gap: 6, minWidth: "min-content" }}>
                {categories.map((c) => {
                  const active = c === cat;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCat(c)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: radius.full,
                        border: "none",
                        cursor: "pointer",
                        background: active ? colors.teal600 : colors.slate100,
                        color: active ? colors.white : colors.slate600,
                        fontWeight: 700,
                        fontSize: 13,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((i) => {
                const q = lines.find((l) => l.id === i.id)?.qty ?? 0;
                return (
                  <div key={i.id} style={{ background: colors.white, borderRadius: radius.lg, padding: 14, display: "flex", gap: 14, boxShadow: shadowSm }}>
                    <div style={{ width: 80, height: 80, borderRadius: radius.md, overflow: "hidden", background: colors.slate100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
                      {menuImageSrc(i.imageUrl) ? (
                        <img src={menuImageSrc(i.imageUrl)!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        "🍽️"
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: colors.slate900, marginBottom: 3 }}>{i.name}</div>
                      {i.description && <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 8, lineHeight: 1.4 }}>{i.description}</div>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: colors.teal600 }}>₹{i.price.toFixed(0)}</div>
                        {q > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <button type="button" onClick={() => dec(i.id)} style={{ width: 32, height: 32, borderRadius: radius.md, border: `1px solid ${colors.slate200}`, background: colors.white, cursor: "pointer", fontWeight: 800 }}>
                              −
                            </button>
                            <span style={{ fontWeight: 800, minWidth: 16, textAlign: "center" }}>{q}</span>
                            <button type="button" onClick={() => inc(i)} style={{ width: 32, height: 32, borderRadius: radius.md, border: `1px solid ${colors.slate200}`, background: colors.white, cursor: "pointer", fontWeight: 800 }}>
                              +
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => inc(i)} style={{ width: 40, height: 40, borderRadius: radius.md, border: "none", cursor: "pointer", background: colors.teal600, color: colors.white, fontSize: 18, fontWeight: 900 }}>
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {addCount > 0 && (
        <button
          type="button"
          disabled={submitting}
          onClick={handleAdd}
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 480,
            margin: "0 auto",
            borderRadius: radius.lg,
            padding: "16px 20px",
            border: "none",
            cursor: submitting ? "wait" : "pointer",
            background: colors.coral400,
            color: colors.white,
            fontWeight: 800,
            fontSize: 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 24px rgba(249,112,102,0.35)",
            zIndex: 20
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: radius.full, fontSize: 13, fontWeight: 900 }}>
              {addCount}
            </span>
            {submitting ? "Adding…" : "Add to Current Order"}
          </span>
          <span style={{ fontWeight: 900 }}>+ ₹{addTotal.toFixed(0)}</span>
        </button>
      )}
    </div>
  );
}

