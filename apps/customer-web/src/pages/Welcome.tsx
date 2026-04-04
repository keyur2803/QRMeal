import { colors, radius, shadowSm } from "../styles/tokens";

type Props = {
  restaurantName: string;
  tableCode: string;
  guests: number;
  onBrowseMenu: () => void;
};

export default function Welcome({ restaurantName, tableCode, guests, onBrowseMenu }: Props) {
  return (
    <div style={{ background: colors.slate50, minHeight: "100vh", padding: "32px 16px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px 20px" }}>
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: `linear-gradient(145deg, ${colors.teal100}, #99f6e4)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              boxShadow: "0 8px 32px rgba(13,148,136,0.15)"
            }}
          >
            <span style={{ fontSize: 44, color: colors.teal700 }} aria-hidden>
              ⌁
            </span>
          </div>

          <div style={{ fontSize: 34, fontWeight: 900, color: colors.teal600, letterSpacing: 5, marginBottom: 6 }}>
            QRMEAL
          </div>
          <div style={{ fontSize: 16, color: colors.slate500, fontWeight: 600 }}>Scan. Order. Enjoy.</div>
        </div>

        <div
          style={{
            background: colors.white,
            borderRadius: radius.lg,
            boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
            padding: "24px 20px",
            margin: "0 4px 16px",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: 13, color: colors.slate400, fontWeight: 600, marginBottom: 4 }}>Welcome to</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: colors.slate900, marginBottom: 14 }}>{restaurantName}</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: colors.teal50,
              padding: "8px 18px",
              borderRadius: radius.full,
              fontSize: 14,
              fontWeight: 700,
              color: colors.teal600
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors.teal500 }} />
            Table {tableCode}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, padding: "0 4px", marginBottom: 12 }}>
          {[
            { icon: "⚡", label: "Quick\nOrdering", bg: colors.teal50, fg: colors.teal600 },
            { icon: "⏱", label: "Real-time\nTracking", bg: "#fff1f2", fg: colors.coral400 },
            { icon: "+", label: "Easy\nAdd-ons", bg: "#f5f3ff", fg: "#a78bfa" }
          ].map((f) => (
            <div
              key={f.label}
              style={{
                flex: 1,
                background: colors.white,
                borderRadius: radius.lg,
                padding: "16px 8px",
                textAlign: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  fontSize: 18,
                  background: f.bg,
                  color: f.fg
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 11, color: colors.slate500, fontWeight: 600, whiteSpace: "pre-line", lineHeight: 1.5 }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            margin: "0 4px 16px",
            padding: 14,
            background: colors.white,
            borderRadius: radius.lg,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
          }}
        >
          <span aria-hidden>👥</span>
          <span style={{ fontSize: 13, color: colors.slate500, fontWeight: 600 }}>Guests at this table:</span>
          <strong style={{ fontSize: 14, color: colors.teal600 }}>{guests}</strong>
        </div>

        <div style={{ padding: "0 4px 24px" }}>
          <button
            type="button"
            onClick={onBrowseMenu}
            style={{
              width: "100%",
              padding: 18,
              fontSize: 16,
              fontWeight: 800,
              borderRadius: radius.lg,
              border: "none",
              background: colors.teal600,
              color: colors.white,
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(13,148,136,0.25)"
            }}
          >
            Browse Menu
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: colors.slate400, fontWeight: 600 }}>
            No app download required · Powered by QRMEAL
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

