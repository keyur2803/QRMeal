/**
 * Kitchen app shell.
 */

import KitchenBoard from "./pages/KitchenBoard";

export default function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <KitchenBoard />
    </div>
  );
}
