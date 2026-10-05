# ADR-002: Relational Database Selection (PostgreSQL)

## Context
Flash sales demand strict ACID compliance, row-level locking, foreign key constraints, and transactional safety for inventory reservations, payments, and order tracking.

## Decision
Select **PostgreSQL 16** with separate logical databases (`salestorm_product`, `salestorm_inventory`, `salestorm_payment`, `salestorm_order`).

## Alternatives
- NoSQL (MongoDB / Cassandra): Rejected because eventual consistency on inventory writes allows race conditions and overselling.

## Trade-offs & Consequences
- **Pros**: ACID transactions, strict check constraints (`available_quantity >= 0`), unique index guards.
- **Cons**: Requires vertical scaling or read-replicas under massive query loads (mitigated by OpenSearch CQRS read model).
