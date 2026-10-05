# SALESTORM Database Design Details & Index Justifications

This document explains the technical justification for every database index, constraint, transaction boundary, and audit column in SALESTORM.

---

## 1. Index Justifications

| Index Name | Table | Columns | Technical Justification |
| :--- | :--- | :--- | :--- |
| `idx_reservations_expires_status` | `inventory_reservations` | `(expires_at, status)` | Enables the automated Reservation Expiry Worker to scan expired 10m TTL reservations in sub-millisecond time without table scans. |
| `idx_products_category` | `products` | `(category_name)` | Accelerates search filtering by product category. |
| `idx_products_brand` | `products` | `(brand)` | Accelerates search filtering by brand. |
| `idx_products_price` | `products` | `(price)` | Optimizes price range filtering (`minPrice` / `maxPrice`) and price sorting (`price_asc`, `price_desc`). |
| `idx_payments_reservation` | `payments` | `(reservation_id)` | Speeds up payment lookup when checking reservation payment status. |
| `idx_payments_status` | `payments` | `(status)` | Used by the Payment Reconciliation Worker to fetch all `UNKNOWN` status payments efficiently. |

---

## 2. Constraints & Integrity Guards

| Constraint Name | Table | Type | Business & System Invariant |
| :--- | :--- | :--- | :--- |
| `available_quantity CHECK >= 0` | `inventory` | CHECK | **CRITICAL INVARIANT**: Ensures database engine rejects any update that would drop available stock below zero. |
| `idempotency_key UNIQUE` | `inventory_reservations`, `payments` | UNIQUE | Prevents duplicate reservation or payment creation on network retries. |
| `transaction_reference UNIQUE` | `payments` | UNIQUE | Prevents double-charging users for the same gateway transaction. |
| `payment_id UNIQUE` | `orders` | UNIQUE | **1-to-1 DEDUPLICATION GUARD**: Prevents duplicate order creation if Kafka redelivers `PaymentSucceeded` events. |
| `tracking_number UNIQUE` | `shipments` | UNIQUE | Guarantees unique tracking codes across carrier shipments. |

---

## 3. Transaction Boundaries & Audit Fields

### Transaction Boundaries (`@Transactional`)
1. **Atomic Inventory Reservation**:
   - `BEGIN` → SQL conditional update on `inventory` → `INSERT` into `inventory_reservations` → `COMMIT`.
2. **Transactional Outbox Event Creation**:
   - `BEGIN` → Save payment / product update → `INSERT` into `payment_outbox` / `product_outbox` → `COMMIT`.

### Audit Fields
- `created_at`: Standard `TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP` for audit traceability.
- `updated_at`: Automatically updated on entity modification to track temporal state changes.
- `version`: Optimistic concurrency version counter incremented on every update.
