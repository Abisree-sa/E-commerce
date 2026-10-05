# SALESTORM — OFFICIAL SYSCRAFTERS 2026 HACKATHON PLATFORM

> **Official Invariant**:  
> **SUCCESSFUL RESERVATIONS MUST NEVER EXCEED AVAILABLE INVENTORY.**  
> *(Proved under 10,000 concurrent purchase attempts against 100 stock units with 0 overselling).*

---

## 1. System Architecture & Load-Balanced Topology

```text
                                Client (React SPA)
                                        │
                         Nginx Load Balancer (:80)
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
Inventory Instance 1 (:8081)  Inventory Instance 2 (:8082)   API Gateway (:8080)
           │                            │                            │
           └────────────────────────────┴────────────────────────────┘
                                        │
    ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
    ▼                   ▼                               ▼                   ▼
Product Service     Search Service               Payment Service       Order Service
(Postgres DB)     (Redis + OpenSearch)             (Outbox Event)     (UNIQUE payment_id)
```

---

## 2. Official 15 Database Entities

SALESTORM implements all 15 required domain entities across isolated schemas:
1. `CUSTOMER`
2. `PRODUCT`
3. `CATEGORY`
4. `INVENTORY`
5. `INVENTORY_RESERVATION`
6. `CART`
7. `CART_ITEM`
8. `ORDER`
9. `ORDER_ITEM`
10. `PAYMENT`
11. `SALE`
12. `DEAL`
13. `COUPON`
14. `SHIPMENT`
15. `NOTIFICATION`

---

## 3. Core Architectural Highlights

- **Atomic SQL Stock Concurrency**: Uses atomic conditional update queries (`WHERE product_id = :id AND available_quantity >= :qty`) rather than pessimistic row locks to prevent overselling and database lock contention under 10,000 concurrent requests.
- **Header-Based Idempotency**: Enforces compulsory `Idempotency-Key` headers on `/reservations`, `/checkout`, `/payments`, and `/orders` backed by `UNIQUE` database constraints.
- **Transactional Outbox Pattern**: Emits domain events (`ProductCreated`, `PaymentSucceeded`) transactionally into database outbox tables to prevent lost events or phantom commits.
- **Order Service Recovery**: Order creation requires `UNIQUE(payment_id)`. If Order Service goes down during payment, `PaymentSucceeded` events remain durable in Kafka/Outbox and create orders upon recovery.
- **Parameter-Aware Redis Caching & Fallback**: Redis Cache-Aside for search queries and product details with graceful fallback to PostgreSQL if Redis becomes unreachable.
- **Nginx Multi-Instance Load Balancing**: Round-robin request distribution across multiple running instances of `inventory-service`.

---

## 4. Documentation Map (Design-First Hackathon Structure)

- **High-Level Design (`docs/hld/`)**:
  - [System Context Diagram](docs/hld/SystemContextDiagram.md)
  - [Container / Service Diagram](docs/hld/ContainerDiagram.md)
  - [Deployment Diagram](docs/hld/DeploymentDiagram.md)
  - [Sync vs. Async Trade-Offs](docs/hld/SyncVsAsync.md)
- **Low-Level Design (`docs/lld/`)**:
  - [Class Diagrams](docs/lld/LLD.md)
  - [SOLID Principles & Design Patterns Code Mapping](docs/lld/SOLID_AND_PATTERNS.md)
- **State & Sequence Diagrams (`docs/diagrams/`)**:
  - [Reservation State Lifecycle](docs/diagrams/ReservationStateDiagram.md)
  - [Order State Machine](docs/diagrams/OrderStateDiagram.md)
  - [Sequence Diagrams](docs/architecture/sequence-diagrams.md)
- **Database Architecture (`docs/database/`)**:
  - [Entity Relationship Diagram (ERD)](docs/database/ERD.md)
  - [Index Justifications & Constraints](docs/database/DatabaseDesignDetails.md)
- **Architectural Decision Records (`docs/adr/`)**:
  - [ADR-001: Microservices Selection](docs/adr/ADR-001-microservices.md)
  - [ADR-002: Relational SQL Database](docs/adr/ADR-002-sql-database.md)
  - [ADR-003: Redis Cache & Fallback](docs/adr/ADR-003-redis-cache.md)
  - [ADR-004: Inventory Concurrency (Approach Comparison)](docs/adr/ADR-004-inventory-concurrency.md)
  - [ADR-005: Sync vs Async Communication](docs/adr/ADR-005-sync-vs-async.md)
  - [ADR-006: Payment Idempotency Keys](docs/adr/ADR-006-payment-idempotency.md)
  - [ADR-007: Nginx Load Balancing](docs/adr/ADR-007-load-balancing.md)

---

## 5. Quick Start Instructions

### Running Backend Service Engine

```bash
cd salestorm
node backend-server.js
```
*Backend server launches at `http://localhost:8080`.*

### Running Frontend Application

```bash
cd salestorm/frontend
npm run dev
```
*Access UI at `http://localhost:3000` (or `http://localhost:3001`).*

### Running Automated Concurrency & Failure Test Suite

```bash
# 10,000 Concurrent Requests Benchmark
node tests/load/run-flash-sale-benchmark.js

# Java Concurrency Test Suite
mvnw test -Dtest=FlashSaleConcurrencyTest

# Failure Recovery Test Suite (Idempotency, Outage Recovery, Redis Fallback)
mvnw test -Dtest=FailureRecoveryTests
```

---

## 6. Hackathon 5-Minute Presentation Outline

1. **The Problem (1 Min)**: Flash-sale traffic spikes cause race conditions, overselling, and lost payment events.
2. **Atomic Concurrency Engine (1 Min)**: Demonstrating atomic SQL conditional updates in PostgreSQL ensuring `available_quantity >= quantity`.
3. **Live Interactive Demo (2 Mins)**: Opening `/admin/flash-sale`, firing **10,000 concurrent purchase attempts**, showing 100 reserved, **0 oversold**, and demonstrating Order Service recovery after outage.
4. **Architecture & SOLID Mapping (1 Min)**: Presenting Nginx load balancing, 15 database entities, Redis graceful degradation, and SOLID extensibility.
