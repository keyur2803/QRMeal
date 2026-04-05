import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { fetchTables, TableRow } from "../api/tables";
import { fetchAdminMenu } from "../api/menu";
import { fetchRecentOrders, createOrder, updateOrderStatus, RecentOrder } from "../api/orders";
import type { MenuItem } from "../types/menu";

// Use the styling approach modeled in our HTML mockups
// We will integrate inline style structures mapping exactly to the Waiter App mockup.
// Waiter-specific CSS could also reside here or in admin.css, but for scoped behavior we will map standard inline-styled components.
import "../styles/admin.css";

type TabView = "pos" | "orders";
type CartItem = MenuItem & { qty: number };

export default function WaiterApp() {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [activeView, setActiveView] = useState<TabView>("pos");

  const initials = (user?.name ?? "W")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // POS State
  const [tables, setTables] = useState<TableRow[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [posLoading, setPosLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Orders State
  const [activeOrders, setActiveOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState<"All" | "Ready" | "Preparing">("All");

  // Format currency
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  useEffect(() => {
    fetchTables().then(setTables).catch(console.error);
    fetchAdminMenu().then((items) => setMenuItems(items.filter(i => i.isAvailable))).catch(console.error);
    loadOrders();
    // Poll orders every 10s if on orders view
    const iv = setInterval(() => {
      if (activeView === "orders") loadOrders();
    }, 10000);
    return () => clearInterval(iv);
  }, [activeView]);

  const loadOrders = () => {
    setOrdersLoading(true);
    fetchRecentOrders().then(setActiveOrders).catch(console.error).finally(() => setOrdersLoading(false));
  };

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(i => i.category));
    return ["All", ...Array.from(cats)];
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, search, activeCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const getQty = (id: string) => cart.find(i => i.id === id)?.qty || 0;

  const adjQty = (item: MenuItem, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (!existing) {
        if (delta > 0) return [...prev, { ...item, qty: 1 }];
        return prev;
      }
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) return prev.filter(i => i.id !== item.id);
      return prev.map(i => i.id === item.id ? { ...i, qty: nextQty } : i);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable) return alert("Select a table first");
    if (cart.length === 0) return alert("Cart is empty");
    
    setPosLoading(true);
    try {
      await createOrder({
        table: selectedTable,
        customerName: "Guest", // Waiters push generic tickets or could be prompted
        placedBy: `WAITER (${user?.name || 'Staff'})`,
        items: cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
      });
      setCart([]);
      setSelectedTable("");
      alert("Order placed successfully!");
      setActiveView("orders");
      loadOrders();
    } catch (err: any) {
      alert("Failed to place order: " + err.message);
    } finally {
      setPosLoading(false);
    }
  };

  const handleMarkServed = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "served", `WAITER (${user?.name})`);
      loadOrders();
    } catch (err: any) {
      alert("Failed up updating status: " + err.message);
    }
  };

  const visibleOrders = activeOrders.filter(o => o.status !== "served" && o.status !== "cancelled").filter(o => {
    if (orderFilter === "Ready") return o.status === "ready";
    if (orderFilter === "Preparing") return o.status === "preparing";
    return true;
  });

  const getSourceDisplay = (order: RecentOrder) => {
    // We didn't pipe placedBy entirely through fetchRecentOrders yet, maybe we just mock it or if the backend sends it we show it.
    // Right now, the recent orders returns generic stuff. We'll derive it from customerName or assume.
    // If backend isn't exposing placedBy inside RecentOrder, we can guess.
    return { isWaiter: false, text: "Customer Order" };
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#f8fafc", zIndex: 100, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#fff", padding: "20px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: -0.5 }}>QRMEAL</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#475569" }}>
          <span>{user?.name?.split(" ")[0] || "Waiter"}</span>
          <div style={{ width: 28, height: 28, backgroundColor: "#ccfbf1", color: "#0f766e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
            {initials}
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div style={{ position: "absolute", top: 66, bottom: 64, left: 0, right: 0, overflowY: "auto", overflowX: "hidden", backgroundColor: "#f8fafc", msOverflowStyle: "none", scrollbarWidth: "none" }}>
        
        {/* POS View */}
        <div style={{ display: activeView === "pos" ? "flex" : "none", flexDirection: "column", minHeight: "100%", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", zIndex: 5, padding: "12px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative", backgroundColor: "#f1f5f9", borderRadius: 12, padding: 2 }}>
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>📍</span>
              <select 
                value={selectedTable}
                onChange={e => setSelectedTable(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 40px", border: "none", backgroundColor: "transparent", fontWeight: 700, color: "#1e293b", fontSize: 14, outline: "none", appearance: "none", cursor: "pointer" }}
              >
                <option value="" disabled>Select Destination Table...</option>
                {tables.map(t => (
                  <option key={t.id} value={t.code}>{t.label} ({t.code})</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "#64748b", pointerEvents: "none" }}>▼</span>
            </div>

            <input 
              placeholder="Search items..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px", borderRadius: 12, border: "1px solid #e2e8f0", outline: "none", fontSize: 14 }}
            />

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  style={{
                    padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
                    backgroundColor: activeCategory === c ? "#0f172a" : "#fff",
                    color: activeCategory === c ? "#fff" : "#475569",
                    border: `1px solid ${activeCategory === c ? "#0f172a" : "#e2e8f0"}`
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "16px 20px 80px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {filteredMenu.map(item => {
              const q = getQty(item.id);
              return (
                <div key={item.id} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 10, display: "flex", gap: 12, alignItems: "center", border: "1px solid #f1f5f9", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <img src={item.imageUrl || ""} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: "#f8fafc", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontWeight: 600, color: "#64748b", fontSize: 13 }}>{fmt.format(item.price)}</div>
                  </div>
                  {q > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "#f8fafc", borderRadius: 20, padding: 4 }}>
                      <button onClick={() => adjQty(item, -1)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#334155", cursor: "pointer" }}>-</button>
                      <span style={{ fontSize: 14, fontWeight: 700, width: 14, textAlign: "center" }}>{q}</span>
                      <button onClick={() => adjQty(item, 1)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#334155", cursor: "pointer" }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => adjQty(item, 1)} style={{ backgroundColor: "#f0fdfa", color: "#0f766e", border: "1px solid #ccfbf1", width: 32, height: 32, borderRadius: 16, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {cartCount > 0 && (
            <div style={{ position: "sticky", bottom: 16, margin: "0 16px 16px", backgroundColor: "#0f172a", color: "#fff", borderRadius: 16, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.3)", zIndex: 40 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{fmt.format(cartTotal)}</span>
                <span style={{ fontSize: 12, color: "#cbd5e1" }}>{cartCount} items selected</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={posLoading}
                style={{ backgroundColor: "#14b8a6", color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", opacity: posLoading ? 0.7 : 1 }}
              >
                {posLoading ? "Placing..." : "Place Order"}
              </button>
            </div>
          )}
        </div>

        {/* Orders View */}
        <div style={{ display: activeView === "orders" ? "flex" : "none", flexDirection: "column", minHeight: "100%", position: "relative" }}>
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ display: "flex", gap: 20, borderBottom: "2px solid #e2e8f0", marginBottom: 16 }}>
              {["All", "Ready", "Preparing"].map(tf => (
                <button
                  key={tf}
                  onClick={() => setOrderFilter(tf as any)}
                  style={{
                    paddingBottom: 12, fontSize: 14, fontWeight: 600, border: "none", background: "none", cursor: "pointer", position: "relative",
                    color: orderFilter === tf ? "#0d9488" : "#64748b"
                  }}
                >
                  {tf}
                  {orderFilter === tf && <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, backgroundColor: "#0d9488", borderRadius: 2 }} />}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 12 }}>
            {ordersLoading && visibleOrders.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>Loading orders...</div>}
            {!ordersLoading && visibleOrders.length === 0 && <div style={{ textAlign: "center", color: "#94a3b8", padding: 20 }}>No active orders</div>}
            
            {visibleOrders.map(o => {
              const isReady = o.status === "ready";
              const isPrep = o.status === "preparing";
              const src = getSourceDisplay(o);

              return (
                <div key={o.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: isReady ? "#14b8a6" : isPrep ? "#f59e0b" : "#94a3b8" }} />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingLeft: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{o.table}</div>
                    <div style={{ 
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
                      backgroundColor: isReady ? "#f0fdfa" : isPrep ? "#fffbeb" : "#f1f5f9",
                      color: isReady ? "#0f766e" : isPrep ? "#b45309" : "#475569"
                     }}>
                      {o.status}
                    </div>
                  </div>
                  
                  <div style={{ paddingLeft: 8, fontSize: 12, color: "#64748b", marginBottom: 16, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                     <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", backgroundColor: src.isWaiter ? "#9333ea" : "#3b82f6" }} /> 
                     {o.orderCode} &middot; {new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, paddingLeft: 8 }}>
                    {o.items.map((it, idx) => (
                      <div key={idx} style={{ display: "flex", fontSize: 14, color: "#334155" }}>
                        <span style={{ fontWeight: 700, width: 24, color: "#0f172a" }}>{it.qty}x</span> 
                        {it.name}
                      </div>
                    ))}
                  </div>

                  <div style={{ paddingLeft: 8 }}>
                    <button 
                      disabled={!isReady}
                      onClick={() => handleMarkServed(o.id)}
                      style={{ 
                        width: "100%", padding: 12, borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", 
                        cursor: isReady ? "pointer" : "not-allowed",
                        backgroundColor: isReady ? "#0f172a" : "#f1f5f9",
                        color: isReady ? "#fff" : "#94a3b8"
                      }}
                    >
                      {isReady ? "Mark as Served" : "Kitchen Working"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Bottom Nav */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTop: "1px solid #e2e8f0", display: "flex", paddingTop: 8, paddingBottom: 24, zIndex: 50 }}>
        <button 
          onClick={() => setActiveView("pos")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", backgroundColor: "transparent", cursor: "pointer", color: activeView === "pos" ? "#0d9488" : "#94a3b8" }}
        >
          <span style={{ fontSize: 22 }}>📝</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>New Order</span>
        </button>
        <button 
          onClick={() => setActiveView("orders")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", backgroundColor: "transparent", cursor: "pointer", color: activeView === "orders" ? "#0d9488" : "#94a3b8" }}
        >
          <span style={{ fontSize: 22 }}>📋</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Active Orders</span>
        </button>
      </div>

    </div>
  );
}
