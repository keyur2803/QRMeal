import { useCart } from "../context/CartContext";
import { menuImageSrc } from "../lib/imageUrl";
import { colors, radius, shadowSm } from "../styles/tokens";
import type { MenuItem } from "../types/menu";

type Props = {
  item: MenuItem;
  onBack: () => void;
  onViewCart: () => void;
};

const DIETARY_ICONS: Record<string, string> = {
  "Vegetarian": "🌿",
  "Vegan": "🌱",
  "Gluten-free": "🌾",
  "Dairy-free": "🥛",
  "Spicy": "🌶️",
  "Chef's Pick": "⭐",
  "Bestseller": "🏆",
};

export default function ItemDetails({ item, onBack, onViewCart }: Props) {
  const { lines, setQty, addItem, itemCount, subtotal } = useCart();
  const cartLine = lines.find((l) => l.menuItemId === item.id);
  const qty = cartLine?.qty || 0;

  const tags = item.dietaryTags ?? [];
  const customizations = item.customizations ?? [];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 50, background: colors.slate50, overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", minHeight: "100%", paddingBottom: 180, background: colors.white, boxShadow: "0 0 20px rgba(0,0,0,0.05)" }}>

        {/* Hero Image */}
        <div style={{ position: "relative", width: "100%", height: 260, background: `linear-gradient(145deg, ${colors.teal50}, ${colors.teal100}, #99f6e4)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, overflow: "hidden" }}>
          {menuImageSrc(item.imageUrl) ? (
            <img src={menuImageSrc(item.imageUrl)!} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            "🍽️"
          )}
          <button
            onClick={onBack}
            style={{ position: "absolute", top: 12, left: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", boxShadow: shadowSm, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: colors.slate700 }}
            aria-label="Back"
          >
            ←
          </button>
          {/* Fav button (decorative) */}
          <button
            style={{ position: "absolute", top: 12, right: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "none", boxShadow: shadowSm, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}
          >
            ♡
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 20px 32px" }}>

          {/* Top dietary tag pill (e.g. Bestseller) */}
          {tags.length > 0 && (
            <div style={{ color: colors.green500, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, border: `1.5px solid ${colors.green500}`, borderRadius: 2, display: "inline-block" }} />
              {tags[0].toUpperCase()}
            </div>
          )}

          {/* Name */}
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: colors.slate900 }}>{item.name}</div>

          {/* Description */}
          {item.description && (
            <div style={{ fontSize: 14, color: colors.slate500, lineHeight: 1.6, marginBottom: 16 }}>{item.description}</div>
          )}

          {/* Meta row: calories + prep time */}
          {(item.calories || item.prepTime) && (
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {item.calories && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: colors.slate500 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.teal50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🔥</div>
                  {item.calories}
                </div>
              )}
              {item.prepTime && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: colors.slate500 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.teal50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⏱</div>
                  {item.prepTime}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: colors.slate500 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: colors.teal50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⭐</div>
                {item.category}
              </div>
            </div>
          )}

          {/* Price row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: colors.teal600 }}>₹{item.price.toFixed(0)}</div>
            {qty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: colors.slate100, padding: 4, borderRadius: radius.full }}>
                <button
                  type="button"
                  onClick={() => setQty(item.id, qty - 1)}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: colors.white, color: colors.slate700, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center" }}
                >−</button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(item.id, qty + 1)}
                  style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: colors.white, color: colors.slate700, fontSize: 16, fontWeight: 600, cursor: "pointer", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center" }}
                >+</button>
              </div>
            )}
          </div>

          {/* Dietary Tags section */}
          {tags.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: colors.slate900 }}>Dietary Info</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: radius.full, fontSize: 13, fontWeight: 500, background: colors.teal50, color: colors.teal700, border: `1.5px solid ${colors.teal100}` }}>
                    {DIETARY_ICONS[tag] ?? "•"} {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Customizations section */}
          {customizations.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: colors.slate900 }}>Customizations</div>
              {customizations.map((c, i) => (
                <div
                  key={i}
                  style={{ padding: "14px 16px", background: colors.slate50, borderRadius: radius.md, marginBottom: 8, fontSize: 14, color: colors.slate700, display: "flex", alignItems: "center", gap: 12 }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${colors.slate300}`, flexShrink: 0 }} />
                  {c}
                </div>
              ))}
            </div>
          )}

          {/* Special instructions */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: colors.slate900 }}>Special Instructions</div>
            <input
              type="text"
              placeholder="Allergies, preferences, cooking notes..."
              style={{ width: "100%", padding: "14px 16px", borderRadius: radius.md, border: `1.5px solid ${colors.slate200}`, fontSize: 14, color: colors.slate700, outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: colors.white }}
            />
          </div>

        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: colors.white, padding: "16px 20px 24px", borderTop: `1px solid ${colors.slate100}`, boxShadow: "0 -4px 20px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 12, zIndex: 60 }}>
        {qty === 0 ? (
          <button
            onClick={() => addItem(item)}
            style={{ width: "100%", padding: "18px", borderRadius: radius.lg, border: "none", background: `linear-gradient(135deg, ${colors.teal500}, ${colors.teal600})`, color: colors.white, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            Add to Cart — <span style={{ opacity: 0.9 }}>₹{item.price.toFixed(0)}</span>
          </button>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: colors.slate100, padding: 4, borderRadius: radius.full, flexShrink: 0 }}>
              <button type="button" onClick={() => setQty(item.id, qty - 1)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: colors.white, color: colors.slate700, fontSize: 18, fontWeight: 600, cursor: "pointer", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{qty}</span>
              <button type="button" onClick={() => setQty(item.id, qty + 1)} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: colors.white, color: colors.slate700, fontSize: 18, fontWeight: 600, cursor: "pointer", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            <button
              onClick={onBack}
              style={{ flex: 1, padding: "14px", borderRadius: radius.lg, border: "none", background: colors.slate900, color: colors.white, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >Keep browsing</button>
          </div>
        )}

        {itemCount > 0 && (
          <button
            onClick={onViewCart}
            style={{ width: "100%", padding: "12px", borderRadius: radius.md, border: `1px solid ${colors.slate200}`, background: "transparent", color: colors.slate700, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span>View cart ({itemCount} items)</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </button>
        )}
      </div>
    </div>
  );
}
