/**
 * Kitchen Display System (KDS) — full-screen dark drag-and-drop board.
 * Ported from the admin panel KDS design.
 * Polls GET /kitchen/board every 10s; PATCHes status on drop/button click.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchBoard, updateOrderStatus } from "../api/kitchen";
import type { KitchenBoard, KitchenOrder, KitchenStatus } from "../types/order";
import { API_BASE } from "../config/env";
import "../styles/kds.css";

// ── helpers ─────────────────────────────────────────────────────────────────

function timerClass(createdAt: string): string {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins >= 12) return "t-crit";
  if (mins >= 7) return "t-warn";
  return "t-ok";
}

function elapsed(createdAt: string): string {
  const secs = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── component ────────────────────────────────────────────────────────────────

export default function KitchenBoard() {
  const [board, setBoard] = useState<KitchenBoard>({ pending: [], preparing: [], ready: [] });
  const [authError, setAuthError] = useState(false);
  const [clock, setClock] = useState("");
  const [tick, setTick] = useState(0);
  const draggingId = useRef<string | null>(null);
  const draggingFromLane = useRef<KitchenStatus | null>(null);

  // tick every second — drives elapsed timers
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // live clock in header
  useEffect(() => {
    const update = () =>
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // poll the API
  const loadBoard = useCallback(async () => {
    try {
      const data = await fetchBoard();
      setBoard(data);
      setAuthError(false);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        setAuthError(true);
      }
      // keep demo/current board on other errors
    }
  }, []);

  useEffect(() => {
    loadBoard();
    const t = setInterval(loadBoard, 10_000);
    return () => clearInterval(t);
  }, [loadBoard]);

  // optimistic status move
  async function moveOrder(orderId: string, toLane: KitchenStatus) {
    setBoard(prev => {
      const all = [...prev.pending, ...prev.preparing, ...prev.ready];
      const order = all.find(o => o.id === orderId);
      if (!order) return prev;
      const updated = { ...order, status: toLane };
      return {
        pending: toLane === "pending" ? [updated, ...prev.pending.filter(o => o.id !== orderId)] : prev.pending.filter(o => o.id !== orderId),
        preparing: toLane === "preparing" ? [updated, ...prev.preparing.filter(o => o.id !== orderId)] : prev.preparing.filter(o => o.id !== orderId),
        ready: toLane === "ready" ? [updated, ...prev.ready.filter(o => o.id !== orderId)] : prev.ready.filter(o => o.id !== orderId),
      };
    });
    try { await updateOrderStatus(orderId, toLane); } catch { /* corrects on next poll */ }
  }

  async function serveOrder(orderId: string) {
    setBoard(prev => ({ ...prev, ready: prev.ready.filter(o => o.id !== orderId) }));
    try { await updateOrderStatus(orderId, "served" as KitchenStatus); } catch { /**/ }
  }

  const counts = {
    pending: board.pending.length,
    preparing: board.preparing.length,
    ready: board.ready.length,
  };

  // suppress unused-var warning from tick — reading it forces re-render
  void tick;

  // ── ticket renderer ────────────────────────────────────────────────────────

  function renderTicket(order: KitchenOrder, lane: KitchenStatus) {
    const tc = timerClass(order.createdAt);
    const time = elapsed(order.createdAt);

    return (
      <article
        key={order.id}
        className="kds-ticket"
        draggable
        onDragStart={() => {
          draggingId.current = order.id;
          draggingFromLane.current = lane;
        }}
        onDragEnd={e => {
          (e.currentTarget as HTMLElement).classList.remove("dragging");
          draggingId.current = null;
        }}
        onMouseDown={e => ((e.currentTarget as HTMLElement).style.opacity = "0.5")}
        onMouseUp={e => ((e.currentTarget as HTMLElement).style.opacity = "1")}
      >
        <div className="kds-ticket-head">
          <div>
            <div className="kds-table">{order.table}</div>
            <div className="kds-id">#{order.orderCode}</div>
          </div>
          <div className={`kds-timer ${tc}`}>{time}</div>
        </div>

        <div className="kds-ticket-body">
          {order.items.map((item, i) => (
            <div className="kds-item" key={i}>
              <div>
                <div className="kds-item-name">{item.name}</div>
                {item.mod && <div className="kds-item-mod">{item.mod}</div>}
              </div>
              <div className="kds-item-qty">x{item.qty}</div>
            </div>
          ))}
          {order.note && <div className="kds-note">⚠ {order.note}</div>}
        </div>

        <div className="kds-ticket-actions">
          {lane === "pending" && (
            <button className="kds-action act-start" onClick={() => moveOrder(order.id, "preparing")}>
              ▶ Start
            </button>
          )}
          {lane === "preparing" && (
            <>
              <button className="kds-action act-ready" onClick={() => moveOrder(order.id, "ready")}>
                ✓ Mark Ready
              </button>
              <button className="kds-action act-reset" onClick={() => moveOrder(order.id, "pending")}>
                ← Back
              </button>
            </>
          )}
          {lane === "ready" && (
            <button className="kds-action act-serve" onClick={() => serveOrder(order.id)}>
              🍽 Served
            </button>
          )}
        </div>
      </article>
    );
  }

  // ── lane renderer ──────────────────────────────────────────────────────────

  function renderLane(lane: KitchenStatus, label: string, orders: KitchenOrder[]) {
    return (
      <section
        className={`kds-lane lane-${lane}`}
        key={lane}
        onDragOver={e => {
          e.preventDefault();
          e.currentTarget.querySelector(".kds-drop")?.classList.add("drag-over");
        }}
        onDragEnter={e => e.preventDefault()}
        onDragLeave={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            e.currentTarget.querySelector(".kds-drop")?.classList.remove("drag-over");
          }
        }}
        onDrop={e => {
          e.currentTarget.querySelector(".kds-drop")?.classList.remove("drag-over");
          if (draggingId.current && draggingFromLane.current !== lane) {
            moveOrder(draggingId.current, lane);
          }
          draggingId.current = null;
        }}
      >
        <div className="kds-lane-head">
          <div className="kds-lane-title">{label}</div>
          <div className="kds-lane-count">{orders.length}</div>
        </div>
        <div className="kds-drop">
          {orders.length === 0
            ? <div className="kds-empty">No orders in this state</div>
            : orders.map(o => renderTicket(o, lane))
          }
        </div>
      </section>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────

  if (authError) {
    // Mid-session token drop or missed fetch
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="kds-page">
      {/* Header */}
      <header className="kds-header">
        <div className="kds-brand">
          <h1>QRMEAL KDS</h1>
          <div className="kds-sub">Fast Kitchen Flow</div>
        </div>
        <div className="kds-summary">
          <div className="kds-chip pending">Pending: {counts.pending}</div>
          <div className="kds-chip preparing">Preparing: {counts.preparing}</div>
          <div className="kds-chip ready">Ready: {counts.ready}</div>
          <div className="kds-clock">🕐 {clock}</div>
          <button 
            onClick={() => {
              fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" })
                .catch(() => {})
                .finally(() => {
                  localStorage.removeItem("qrmeal_token");
                  window.location.reload();
                });
            }}
            style={{ marginLeft: 16, background: "transparent", color: "#f97066", border: "1.5px solid #f97066", padding: "4px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
            title="Log out"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Guide strip */}
      <div className="kds-guide">
        <div>Drag any order card to move status quickly.</div>
        <div>Tip: Use button actions for one-tap update while cooking.</div>
      </div>

      {/* Board */}
      <main className="kds-board">
        {renderLane("pending", "Pending", board.pending)}
        {renderLane("preparing", "Preparing", board.preparing)}
        {renderLane("ready", "Ready", board.ready)}
      </main>
    </div>
  );
}
