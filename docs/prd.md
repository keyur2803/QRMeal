# QRMEAL MVP Product Requirements

## Objective
Build a QR-based restaurant ordering platform with live kitchen execution and owner controls.

## Primary Users
- Guest customer scanning a table QR.
- Kitchen staff preparing and marking orders.
- Restaurant owner/admin managing menu and operations.

## Core Flows
1. Customer scans QR and starts an order for a table.
2. Customer browses menu, customizes items, checks out.
3. Order appears in kitchen display in `pending`.
4. Kitchen moves order `pending -> preparing -> ready -> served`.
5. Customer sees live order status updates.
6. Owner monitors dashboard and manages menu.

## MVP Features
- Table QR entry and table-bound session.
- Menu browsing with categories and search.
- Item customization and cart.
- COD/Counter payment mode.
- Kitchen drag-and-drop status workflow.
- Owner dashboard with live queue and menu CRUD.

## Non-Goals
- Loyalty program.
- Coupons/promotions engine.
- Multi-branch support.
- Third-party delivery integrations.
- Advanced BI analytics.
