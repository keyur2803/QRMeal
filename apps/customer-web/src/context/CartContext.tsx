/**
 * Shopping cart — line items keyed by menu item id.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { MenuItem } from "../types/menu";

export type CartLine = {
  menuItemId: string;
  name: string;
  imageUrl: string | null;
  price: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (item: MenuItem) => void;
  setQty: (menuItemId: string, qty: number) => void;
  removeLine: (menuItemId: string) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addItem = useCallback((item: MenuItem) => {
    if (!item.isAvailable) return;
    setLines((prev) => {
      const i = prev.findIndex((l) => l.menuItemId === item.id);
      if (i === -1) {
        return [
          ...prev,
          { menuItemId: item.id, name: item.name, imageUrl: item.imageUrl, price: item.price, qty: 1 }
        ];
      }
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + 1 };
      return next;
    });
  }, []);

  const setQty = useCallback((menuItemId: string, qty: number) => {
    if (qty < 1) {
      setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
      return;
    }
    setLines((prev) => prev.map((l) => (l.menuItemId === menuItemId ? { ...l, qty } : l)));
  }, []);

  const removeLine = useCallback((menuItemId: string) => {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => {
    const itemCount = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    return { lines, addItem, setQty, removeLine, clear, itemCount, subtotal };
  }, [lines, addItem, setQty, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
