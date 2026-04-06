import React from "react";
import { ArrowLeft, Armchair } from "lucide-react";
import { colors, radius } from "../styles/tokens";

type HeaderProps = {
  /** Optional title to show instead of logo (e.g. "Your Order") */
  title?: string;
  /** Table code string (e.g. "T-101") */
  tableCode: string;
  /** Optional back button handler */
  onBack?: () => void;
  /** Extra content below the top row (e.g. search bar, tabs) */
  children?: React.ReactNode;
  /** Whether the header should be sticky. Default: true */
  sticky?: boolean;
};

/**
 * Shared Header component for Customer Web.
 * Encapsulates Logo/Title and Table Information with a premium look.
 */
export default function Header({ 
  title, 
  tableCode, 
  onBack, 
  children, 
  sticky = true 
}: HeaderProps) {
  // Format table code for display
  const displayTable = tableCode.replace(/^T-?/, "");

  return (
    <header
      style={{
        position: sticky ? "sticky" : "relative",
        top: 0,
        zIndex: 40,
        background: colors.white,
        backdropFilter: "blur(12px)",
        padding: "14px 16px 0",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 40, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                fontSize: 18,
                cursor: "pointer",
                color: colors.slate800,
                background: colors.white,
                border: `1.5px solid ${colors.slate100}`,
                width: 40,
                height: 40,
                borderRadius: radius.md,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease",
                marginRight: 4
              }}
              aria-label="Back"
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
          )}
          {title ? (
            <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.slate900, margin: 0 }}>{title}</h1>
          ) : (
            <div style={{ fontSize: 24, fontWeight: 900, color: colors.teal600, letterSpacing: 1.5, margin: 0 }}>
              QRMEAL
            </div>
          )}
        </div>
        
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: colors.teal700,
            background: colors.teal50,
            padding: "6px 14px",
            borderRadius: radius.full,
            border: `1.5px solid ${colors.teal100}`,
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 1px 2px rgba(13, 148, 136, 0.05)"
          }}
        >
          <Armchair size={14} strokeWidth={2.5} />
          <span>{displayTable}</span>
        </div>
      </div>
      {children}
    </header>
  );
}
