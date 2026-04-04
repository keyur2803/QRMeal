import { useEffect, useMemo, useState } from "react";
import { fetchOrders, type OrderDto } from "../api/orders";
import { colors, radius } from "../styles/tokens";

type Props = {
  orderId: string;
  orderCode: string;
  onAddMore: () => void;
  onBrowseMenu: () => void;
  onClearOrder: () => void;
};

const STEP_ORDER = ["pending", "preparing", "ready", "served"] as const;

function titleForStatus(status: string) {
  if (status === "pending")
    return {
      emoji: "🧾",
      title: "Order Placed",
      sub: "We’ve received your order.",
    };
  if (status === "preparing")
    return {
      emoji: "🔥",
      title: "Preparing Your Order",
      sub: "Chef is working on your meal!",
    };
  if (status === "ready")
    return {
      emoji: "✅",
      title: "Ready for Pickup",
      sub: "Your order is ready.",
    };
  if (status === "served")
    return { emoji: "🍽️", title: "Served to Table", sub: "Enjoy your meal!" };
  if (status === "cancelled")
    return {
      emoji: "⚠️",
      title: "Order Cancelled",
      sub: "Please contact staff if needed.",
    };
  return { emoji: "🕒", title: "Order Status", sub: "Checking updates…" };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderStatus({
  orderId,
  orderCode,
  onAddMore,
  onBrowseMenu,
  onClearOrder,
}: Props) {
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;

    async function refresh() {
      try {
        const orders = await fetchOrders();
        if (cancelled) return;
        const found = orders.find((o) => o.id === orderId) ?? null;
        setOrder(found);
        setError(null);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    refresh();
    interval = window.setInterval(refresh, 5000);

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [orderId]);

  const currentStatus = order?.status ?? "pending";
  const hero = titleForStatus(currentStatus);

  const heroSeenKey = `qrmeal_order_status_hero_seen_${orderId}`;
  const [showHero, setShowHero] = useState(() => {
    try {
      return localStorage.getItem(heroSeenKey) !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      setShowHero(localStorage.getItem(heroSeenKey) !== "1");
    } catch {
      setShowHero(true);
    }
  }, [heroSeenKey]);

  useEffect(() => {
    if (!showHero) return;
    try {
      localStorage.setItem(heroSeenKey, "1");
    } catch {
      return;
    }
    const t = window.setTimeout(() => setShowHero(false), 1200);
    return () => window.clearTimeout(t);
  }, [heroSeenKey, showHero]);

  const stepTimes = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of order?.history ?? []) {
      map.set(h.to, h.at);
    }
    return map;
  }, [order?.history]);

  const activeIndex = STEP_ORDER.indexOf(
    (currentStatus as (typeof STEP_ORDER)[number]) ?? "pending",
  );
  const etaMinutes =
    currentStatus === "pending"
      ? 18
      : currentStatus === "preparing"
        ? 12
        : currentStatus === "ready"
          ? 0
          : null;

  return (
    <div
      style={{
        margin: "0 -16px",
        background: colors.slate50,
        minHeight: "calc(100vh - 32px)",
      }}
    >
      {showHero ? (
        <div
          style={{
            background: `linear-gradient(145deg, ${colors.teal500}, ${colors.teal600}, ${colors.teal700})`,
            padding: "20px 16px 48px",
            color: colors.white,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800 }}>Order Status</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.8,
                background: "rgba(255,255,255,0.15)",
                padding: "4px 10px",
                borderRadius: radius.full,
              }}
            >
              #{order?.orderCode ?? orderCode}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }} aria-hidden>
              {hero.emoji}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
              {hero.title}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 600 }}>
              {hero.sub}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowHero(true)}
          style={{
            width: "100%",
            background: `linear-gradient(145deg, ${colors.teal500}, ${colors.teal600}, ${colors.teal700})`,
            padding: "12px 16px 16px",
            color: colors.white,
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900 }}>Order Status</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.85,
                background: "rgba(255,255,255,0.15)",
                padding: "4px 10px",
                borderRadius: radius.full,
              }}
            >
              #{order?.orderCode ?? orderCode}
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 22 }} aria-hidden>
              {hero.emoji}
            </span>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{hero.title}</div>
          </div>
        </button>
      )}

      <div style={{ padding: "0 16px 24px", marginTop: showHero ? -24 : 0 }}>
        {loading && <div style={{ color: colors.slate500 }}>Loading…</div>}
        {error && (
          <div
            style={{
              color: "#b91c1c",
              background: "#fef2f2",
              padding: 12,
              borderRadius: radius.md,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}
        {!loading && !order && !error && (
          <div
            style={{
              background: colors.white,
              borderRadius: radius.lg,
              padding: 16,
              boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>
              Order not found
            </div>
            <div
              style={{ color: colors.slate500, fontSize: 13, marginBottom: 12 }}
            >
              This usually means you are connected to a different
              database/environment.
            </div>
            <button
              type="button"
              onClick={onBrowseMenu}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: radius.lg,
                border: "none",
                background: colors.teal600,
                color: colors.white,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Browse Menu
            </button>
          </div>
        )}

        {order && (
          <>
            <div
              style={{
                background: colors.white,
                borderRadius: radius.lg,
                padding: 18,
                textAlign: "center",
                marginBottom: 14,
                boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                border: `1.5px solid ${colors.teal100}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: colors.teal600,
                  fontWeight: 800,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Estimated Ready In
              </div>
              {etaMinutes === null ? (
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: colors.teal600,
                  }}
                >
                  —
                </div>
              ) : etaMinutes === 0 ? (
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: colors.teal600,
                  }}
                >
                  Ready
                </div>
              ) : (
                <div>
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      color: colors.teal600,
                    }}
                  >
                    {etaMinutes}
                  </span>{" "}
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: colors.teal600,
                    }}
                  >
                    minutes
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                background: colors.white,
                borderRadius: radius.lg,
                boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
                padding: 18,
                marginBottom: 14,
              }}
            >
              <div style={{ position: "relative", paddingLeft: 28 }}>
                <div
                  style={{
                    position: "absolute",
                    left: 11,
                    top: 10,
                    bottom: 10,
                    width: 2,
                    background: colors.slate200,
                  }}
                />
                {STEP_ORDER.map((s, idx) => {
                  const done = idx < activeIndex;
                  const active = idx === activeIndex;
                  const dotBg =
                    done || active ? colors.teal500 : colors.slate200;
                  const title =
                    s === "pending"
                      ? "Order Placed"
                      : s === "preparing"
                        ? "Being Prepared"
                        : s === "ready"
                          ? "Ready for Pickup"
                          : "Served to Table";
                  const timeIso = stepTimes.get(s);
                  return (
                    <div
                      key={s}
                      style={{
                        position: "relative",
                        paddingBottom: idx === STEP_ORDER.length - 1 ? 0 : 24,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: -28,
                          top: 2,
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: dotBg,
                          border: `3px solid ${colors.white}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(done || active) && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: colors.white,
                            }}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color:
                            done || active ? colors.slate900 : colors.slate400,
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: colors.slate400,
                          marginTop: 2,
                        }}
                      >
                        {timeIso
                          ? formatTime(timeIso)
                          : active
                            ? "In progress…"
                            : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                background: colors.white,
                borderRadius: radius.lg,
                boxShadow: "0 6px 16px rgba(15,23,42,0.06)",
                padding: 16,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  marginBottom: 12,
                  color: colors.slate700,
                }}
              >
                Your Items
              </div>
              {order.items.map((i) => (
                <div
                  key={i.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: `1px solid ${colors.slate100}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: colors.amber400,
                      }}
                    />
                    {i.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.slate400,
                      fontWeight: 700,
                    }}
                  >
                    x{i.qty}
                  </div>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  fontWeight: 900,
                }}
              >
                <span>Total</span>
                <span style={{ color: colors.teal600 }}>
                  ₹{order.total.toFixed(0)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onAddMore}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: radius.lg,
                border: `1.5px solid ${colors.slate200}`,
                background: colors.white,
                color: colors.slate700,
                fontWeight: 900,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              + Add More Items to This Order
            </button>
            <button
              type="button"
              onClick={() => window.alert("Waiter has been notified.")}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: radius.lg,
                border: "none",
                background: "transparent",
                color: colors.slate400,
                fontWeight: 800,
                cursor: "pointer",
                marginBottom: 10,
              }}
            >
              🔔 Call Waiter
            </button>
            {(order.status === "served" || order.status === "cancelled") && (
              <button
                type="button"
                onClick={onClearOrder}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: radius.lg,
                  border: `1px solid ${colors.slate200}`,
                  background: colors.white,
                  color: colors.slate700,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Clear Order
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
