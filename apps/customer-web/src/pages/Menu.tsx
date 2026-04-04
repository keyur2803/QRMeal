/**
 * Menu browse — matches design-system menu.html: search, category tabs, cards, promo, cart bar.
 */

import { useEffect, useMemo, useState } from "react";
import { fetchMenu } from "../api/menu";
import { useCart } from "../context/CartContext";
import { menuImageSrc } from "../lib/imageUrl";
import { colors, radius, shadowSm } from "../styles/tokens";
import type { MenuItem } from "../types/menu";
import ItemDetails from "./ItemDetails";

const FOOD_ICONS = ["\uD83C\uDF55", "\uD83C\uDF5C", "\uD83E\uDD57", "\uD83C\uDF56", "\uD83C\uDF36", "\uD83C\uDF79", "\uD83E\uDDC0"];

type Props = {
  tableCode: string;
  onViewCart: () => void;
};

export default function Menu({ tableCode, onViewCart }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const { lines, setQty, addItem, itemCount, subtotal } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchMenu();
        if (!cancelled) setItems(data);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", "Popular", ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (!i.isAvailable) return false;
      if (q && !(`${i.name} ${i.description ?? ""} ${i.category}`.toLowerCase().includes(q))) return false;
      if (category === "All") return true;
      if (category === "Popular") return true; // demo: same as all; could flag bestsellers later
      return i.category === category;
    });
  }, [items, search, category]);

  function iconFor(index: number) {
    return FOOD_ICONS[index % FOOD_ICONS.length];
  }

  if (selectedItem) {
    return <ItemDetails item={selectedItem} onBack={() => setSelectedItem(null)} onViewCart={onViewCart} />;
  }

  return (
    <div style={{ margin: "0 -16px" }}>
      {/* Sticky header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: colors.white,
          padding: "12px 16px 0",
          borderBottom: `1px solid ${colors.slate100}`
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: colors.slate900 }}>Menu</div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: colors.teal600,
              background: colors.teal50,
              padding: "6px 14px",
              borderRadius: radius.full
            }}
          >
            Table {tableCode}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: colors.slate100,
              borderRadius: radius.md,
              padding: "12px 16px"
            }}
          >
            <span style={{ color: colors.slate400, fontSize: 16 }} aria-hidden>
              &#128269;
            </span>
            <input
              type="search"
              placeholder="Search dishes, drinks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: 14,
                outline: "none",
                color: colors.slate700
              }}
            />
          </div>
        </div>

        <div style={{ paddingBottom: 14, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: 6, minWidth: "min-content" }}>
            {categories.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: radius.full,
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    border: "none",
                    cursor: "pointer",
                    background: active ? colors.teal600 : colors.slate100,
                    color: active ? colors.white : colors.slate600
                  }}
                >
                  {cat === "Popular" ? "\u2B50 Popular" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 120px", background: colors.slate50, minHeight: 280 }}>
        {loading && <p style={{ color: colors.slate500 }}>Loading menu…</p>}
        {error && (
          <p style={{ color: "#b91c1c", background: "#fef2f2", padding: 12, borderRadius: radius.md }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.teal600}, ${colors.teal500})`,
                borderRadius: radius.lg,
                padding: "16px 20px",
                color: colors.white,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Happy Hour Special!</div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>Ask staff for today&apos;s deals</div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "6px 14px",
                  borderRadius: radius.full,
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                QRMEAL
              </div>
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: colors.slate400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "8px 0 4px"
              }}
            >
              {category === "Popular" ? "Popular picks" : "Menu"}
            </div>

            {filtered.length === 0 && (
              <p style={{ color: colors.slate500, fontSize: 14 }}>No items match your search.</p>
            )}

            {filtered.map((item, idx) => {
              const cartLine = lines.find((l) => l.menuItemId === item.id);
              const qty = cartLine?.qty || 0;
              return (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: colors.white,
                  borderRadius: radius.lg,
                  padding: 14,
                  display: "flex",
                  gap: 14,
                  marginBottom: 10,
                  boxShadow: shadowSm,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent"
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: radius.md,
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    background: `linear-gradient(135deg, ${colors.teal50}, ${colors.teal100})`
                  }}
                >
                  {menuImageSrc(item.imageUrl) ? (
                    <img
                      src={menuImageSrc(item.imageUrl)!}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    iconFor(idx)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: colors.slate900, marginBottom: 3 }}>{item.name}</div>
                  {item.description && (
                    <div style={{ fontSize: 12, color: colors.slate400, marginBottom: 8, lineHeight: 1.4 }}>
                      {item.description}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors.teal600 }}>₹{item.price.toFixed(0)}</div>
                    {qty > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, background: colors.teal50, borderRadius: 10, padding: 4 }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQty(item.id, qty - 1); }}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: "none",
                            background: colors.teal600, color: colors.white, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                          }}
                        >-</button>
                        <span style={{ fontSize: 14, fontWeight: 700, color: colors.teal700, minWidth: 16, textAlign: "center" }}>{qty}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setQty(item.id, qty + 1); }}
                          style={{
                            width: 28, height: 28, borderRadius: 8, border: "none",
                            background: colors.teal600, color: colors.white, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                          }}
                        >+</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); addItem(item); }}
                        style={{
                          height: 36,
                          width: 104,
                          borderRadius: 10,
                          border: "none",
                          background: colors.teal50,
                          color: colors.teal700,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4
                        }}
                        aria-label={`Add ${item.name}`}
                      >
                        ADD <span style={{ fontSize: 16 }}>+</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
              );
            })}
          </>
        )}
      </div>

      {/* Float bar — design-system float-bar teal */}
      {itemCount > 0 && (
        <button
          type="button"
          onClick={onViewCart}
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
            cursor: "pointer",
            background: colors.teal600,
            color: colors.white,
            fontWeight: 600,
            fontSize: 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 24px rgba(13,148,136,0.35)",
            zIndex: 20
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "4px 10px",
                borderRadius: radius.full,
                fontSize: 13,
                fontWeight: 700
              }}
            >
              {itemCount}
            </span>
            View cart
          </span>
          <span style={{ fontWeight: 700 }}>₹{subtotal.toFixed(0)}</span>
        </button>
      )}
    </div>
  );
}
