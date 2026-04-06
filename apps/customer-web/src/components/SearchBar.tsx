import { Search } from "lucide-react";
import { colors, radius } from "../styles/tokens";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search dishes, drinks..."
}: Props) {
  return (
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
      <Search size={18} style={{ color: colors.slate400 }} aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
