import React from "react";
import { X, Plus, Minus, Flame, Clock } from "lucide-react";
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

/**
 * Item Details Bottom Sheet.
 * Redesigned for a premium native look with bottom-up entry.
 */
export default function ItemDetails({ item, onBack, onViewCart }: Props) {
  const { lines, setQty, addItem, itemCount, subtotal } = useCart();
  const cartLine = lines.find((l) => l.menuItemId === item.id);
  const qty = cartLine?.qty || 0;

  const tags = item.dietaryTags ?? [];

  return (
    <div 
      style={{ 
        position: "fixed", 
        inset: 0, 
        zIndex: 100, 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "flex-end" 
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onBack}
        style={{ 
          position: "absolute", 
          inset: 0, 
          background: "rgba(15, 23, 42, 0.4)", 
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          animation: "fadeIn 0.3s ease-out" 
        }} 
      />

      {/* Sheet Container */}
      <div 
        style={{ 
          position: "relative", 
          width: "100%", 
          maxWidth: 480, 
          margin: "0 auto", 
          background: colors.white, 
          borderRadius: "24px 24px 0 0", 
          overflow: "hidden", 
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.15)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Sticky Close Button (Cross) */}
        <button
          onClick={onBack}
          style={{ 
            position: "absolute", 
            top: 16, 
            right: 16, 
            width: 36, 
            height: 36, 
            borderRadius: "50%", 
            background: "rgba(255, 255, 255, 0.9)", 
            backdropFilter: "blur(8px)", 
            border: "none", 
            boxShadow: shadowSm, 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 20, 
            color: colors.slate800,
            zIndex: 10
          }}
          aria-label="Close"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div style={{ overflowY: "auto" }}>
          {/* Hero Image */}
          <div style={{ 
            width: "100%", 
            height: 240, 
            background: `linear-gradient(135deg, ${colors.teal50}, ${colors.teal100})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            overflow: "hidden"
          }}>
            {menuImageSrc(item.imageUrl) ? (
              <img src={menuImageSrc(item.imageUrl)!} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              "🍽️"
            )}
          </div>

          {/* Content */}
          <div style={{ padding: "24px 20px 40px" }}>
            {/* Header Row: Name/Price + Add Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: colors.slate900, margin: "0 0 4px 0" }}>{item.name}</h2>
                <div style={{ fontSize: 22, fontWeight: 800, color: colors.teal600 }}>₹{item.price.toFixed(0)}</div>
              </div>
              
              {/* Add / Qty Control */}
              <div style={{ flexShrink: 0 }}>
                {qty === 0 ? (
                  <button
                    onClick={() => addItem(item)}
                    style={{ 
                      padding: "12px 24px", 
                      borderRadius: radius.lg, 
                      border: "none", 
                      background: `linear-gradient(135deg, ${colors.teal600}, ${colors.teal500})`, 
                      color: colors.white, 
                      fontSize: 16, 
                      fontWeight: 700, 
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(13, 148, 136, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      gap: 8
                    }}
                  >
                    ADD <Plus size={16} strokeWidth={3} />
                  </button>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12, background: colors.slate100, padding: 6, borderRadius: radius.full }}>
                    <button 
                      type="button" 
                      onClick={() => setQty(item.id, qty - 1)} 
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: colors.white, color: colors.slate700, cursor: "pointer", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 800, minWidth: 24, textAlign: "center", color: colors.slate900 }}>{qty}</span>
                    <button 
                      type="button" 
                      onClick={() => setQty(item.id, qty + 1)} 
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: colors.white, color: colors.slate700, cursor: "pointer", boxShadow: shadowSm, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div style={{ fontSize: 15, color: colors.slate600, lineHeight: 1.6, marginBottom: 20 }}>
                {item.description}
              </div>
            )}

            {/* Meta Row: Calories & Prep Time */}
            {(item.calories || item.prepTime) && (
              <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
                {item.calories && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: colors.slate500, background: colors.slate50, padding: "6px 12px", borderRadius: radius.md }}>
                    <Flame size={14} style={{ color: colors.coral400 }} />
                    <span style={{ fontWeight: 600 }}>{item.calories} kcal</span>
                  </div>
                )}
                {item.prepTime && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: colors.slate500, background: colors.slate50, padding: "6px 12px", borderRadius: radius.md }}>
                    <Clock size={14} style={{ color: colors.teal600 }} />
                    <span style={{ fontWeight: 600 }}>{item.prepTime}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dietary Tags */}
            {tags.length > 0 && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.slate400, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Dietary Info
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 6, 
                        padding: "8px 16px", 
                        borderRadius: radius.full, 
                        fontSize: 13, 
                        fontWeight: 600, 
                        background: colors.teal50, 
                        color: colors.teal700, 
                        border: `1.5px solid ${colors.teal100}` 
                      }}
                    >
                      {DIETARY_ICONS[tag] ?? "•"} {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart Summary if any items added */}
        {itemCount > 0 && (
          <div style={{ padding: "16px 20px 24px", borderTop: `1px solid ${colors.slate100}`, background: colors.white }}>
            <button
              onClick={onViewCart}
              style={{ 
                width: "100%", 
                padding: "16px", 
                borderRadius: radius.lg, 
                border: "none", 
                background: colors.slate900, 
                color: colors.white, 
                fontSize: 15, 
                fontWeight: 700, 
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>View your cart • {itemCount} items</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
