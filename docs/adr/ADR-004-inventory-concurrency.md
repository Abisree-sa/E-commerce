# ADR-004: Inventory Concurrency Control (Approach Comparison)

## Context
When 10,000 concurrent purchase attempts hit 100 available stock units, race conditions can cause overselling.

## Comparison of Concurrency Approaches

### Approach A: Pessimistic Locking (`SELECT FOR UPDATE`)
```sql
BEGIN;
SELECT available_quantity FROM inventory WHERE product_id = :id FOR UPDATE;
IF available_quantity >= :qty THEN
    UPDATE inventory SET available_quantity = available_quantity - :qty WHERE product_id = :id;
END IF;
COMMIT;
```
- **Trade-offs**: Holds explicit database row locks. Under 10,000 concurrent requests, results in severe database thread blocking, lock contention, deadlocks, and connection pool exhaustion.

---

### Approach B: Atomic Conditional Update (Selected Implementation)
```sql
UPDATE inventory
SET available_quantity = available_quantity - :quantity,
    reserved_quantity = reserved_quantity + :quantity,
    version = version + 1
WHERE product_id = :productId
  AND available_quantity >= :quantity;
```
- **Trade-offs**: Executes atomically inside PostgreSQL engine in a single SQL statement. Check affected row count (`rowsAffected == 1` → Granted, `0` → Out of Stock). Zero thread lock wait, high throughput, **guarantees zero overselling**.

## Decision
Adopt **Approach B (Atomic Conditional Update)** as the authoritative concurrency engine.
