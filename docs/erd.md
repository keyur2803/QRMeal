# QRMEAL ERD (MVP)

## Entities
- `users` (id, name, email, password_hash, role, is_active)
- `tables` (id, code, label, is_active)
- `menu_categories` (id, name, sort_order)
- `menu_items` (id, category_id, name, description, price, is_available)
- `orders` (id, order_code, table_id, customer_name, status, total_amount, payment_mode, created_at)
- `order_items` (id, order_id, menu_item_id, item_name, qty, unit_price, notes)
- `order_status_history` (id, order_id, from_status, to_status, changed_by, changed_at)
- `payments` (id, order_id, amount, method, status, reference, paid_at)

## Relationships
- One `table` has many `orders`.
- One `order` has many `order_items`.
- One `order` has many `order_status_history` entries.
- One `order` has zero or one `payment` (MVP COD/counter allows pending record).
- One `menu_category` has many `menu_items`.
