# Synchronous vs. Asynchronous Communication Architecture

SALESTORM strategically balances **Synchronous (REST)** and **Asynchronous (Kafka Domain Events)** communication patterns to optimize latency, consistency, and fault isolation.

---

## 1. Communication Breakdown Matrix

| Interaction | Protocol / Pattern | Type | Justification |
| :--- | :--- | :--- | :--- |
| **Product Search / Query** | REST (`GET /api/v1/search`) | **Synchronous** | User requires immediate sub-10ms response on screen. |
| **Cart Management** | REST (`POST /api/v1/carts`) | **Synchronous** | Immediate client feedback on UI cart items. |
| **Inventory Reservation** | REST (`POST /api/v1/reservations`) | **Synchronous** | User must immediately know if flash sale stock was successfully locked or sold out (409). |
| **Payment Charge Initiation** | REST (`POST /api/v1/payments`) | **Synchronous** | Immediate feedback on card approval or decline. |
| **PaymentSucceeded Event** | Kafka Topic (`payment-events`) | **Asynchronous** | Decouples Payment Service from Order Service. Ensures event survives Order Service downtime. |
| **ProductCreated / Updated** | Kafka Topic (`product-events`) | **Asynchronous** | Decouples Product DB writes from OpenSearch read-model indexing. |
| **Shipment & Notifications** | Kafka Topic (`order-events`) | **Asynchronous** | Background email/SMS dispatch without blocking HTTP user threads. |

---

## 2. Trade-Off Analysis

### Synchronous Communication (REST / HTTP)
- **Pros**: Simple, immediate response payload, zero event lag for user-facing validation.
- **Cons**: Cascading latency, tight coupling between caller and callee, availability depends on downstream service.

### Asynchronous Event-Driven Communication (Kafka + Outbox)
- **Pros**: Total microservice temporal decoupling, high availability, message durability during consumer outages, zero loss of business transactions.
- **Cons**: Eventual consistency (mitigated by version numbers on events and idempotency keys on consumers).
