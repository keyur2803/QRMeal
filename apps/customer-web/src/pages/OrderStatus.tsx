import React from "react";

const statuses = ["pending", "preparing", "ready", "served"];

export default function OrderStatus() {
  return (
    <section>
      <h1>Order Status</h1>
      <ol>
        {statuses.map((status) => (
          <li key={status}>{status}</li>
        ))}
      </ol>
    </section>
  );
}
