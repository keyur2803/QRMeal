import { Star } from "lucide-react";
import { colors, radius } from "../styles/tokens";

type Props = {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
};

export default function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  return (
    <div
      style={{
        minHeight: 36,
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ display: "flex", gap: 6, minWidth: "min-content" }}>
        {categories.map((cat) => {
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: radius.full,
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                border: "none",
                cursor: "pointer",
                background: active ? colors.teal600 : "rgba(241,245,249,0.78)",
                color: active ? colors.white : colors.slate600
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {cat === "Popular" && <Star size={14} fill="currentColor" />}
                {cat}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
