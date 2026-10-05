# ADR-002: Atomic SQL Conditional Updates for Zero Overselling

## Context
During flash-sale events, 10,000+ concurrent purchase requests attempt to reserve inventory for a limited stock pool (e.g. 100 units). Naive `SELECT stock → UPDATE stock` logic results in high overselling rates under race conditions.

## Decision
Enforce stock reservations directly in PostgreSQL via atomic conditional SQL update queries:

```sql
UPDATE inventory
SET available_quantity = available_quantity - :qty,
    reserved_quantity = reserved_quantity + :qty,
    version = version + 1
WHERE product_id = :id AND available_quantity >= :qty;
```

Check the return value (`rowsAffected`):
- `1` → Reservation Granted.
- `0` → `409 OUT_OF_STOCK`.

## Alternatives Considered
- Java `synchronized` blocks (rejected: single JVM lock fails across horizontal microservice instances).
- Pessimistic `SELECT FOR UPDATE` DB locking (rejected: severe database lock contention and connection pool exhaustion).
- Redis Lua Scripts (rejected: inventory state must persist transactionally with reservations).

## Consequences
Guarantees `available_quantity` never drops below zero under extreme concurrency.
