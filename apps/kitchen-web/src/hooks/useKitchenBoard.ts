/**
 * Hook that polls the kitchen board API and provides
 * a move() function to transition order status.
 */

import { useCallback, useEffect, useState } from "react";
import { fetchBoard, updateOrderStatus } from "../api/kitchen";
import type { KitchenBoard, KitchenStatus } from "../types/order";

const POLL_INTERVAL_MS = 5_000;

export function useKitchenBoard() {
  const [board, setBoard] = useState<KitchenBoard>({ pending: [], preparing: [], ready: [] });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setBoard(await fetchBoard());
      setError(null);
    } catch {
      setError("Could not load board");
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const move = useCallback(async (orderId: string, next: KitchenStatus) => {
    try {
      await updateOrderStatus(orderId, next);
      await load();
    } catch {
      setError("Could not update order");
    }
  }, [load]);

  return { board, error, refresh: load, move } as const;
}
