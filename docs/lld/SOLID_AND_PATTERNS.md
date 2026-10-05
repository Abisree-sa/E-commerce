# SALESTORM — SOLID PRINCIPLES & DESIGN PATTERNS CODE MAPPING

This document maps OOP SOLID Principles and classic Design Patterns directly to concrete Java classes in the SALESTORM Spring Boot codebase.

---

## 1. SOLID Principles Code Mapping

### S — Single Responsibility Principle (SRP)
- **`InventoryService`**: Responsible solely for managing inventory stock state and reservation lifecycle. It does not handle HTTP requests, payment calculations, or order creation.
- **`ReservationRepository`**: Responsible solely for persistence and Idempotency Key query lookups for stock reservations.
- **`PaymentOutboxRepository`**: Responsible solely for transactional outbox persistence of `PaymentSucceeded` events.

### O — Open/Closed Principle (OCP)
- **`PaymentProvider` Interface**: Open for extension (e.g. `StripePaymentAdapter`, `PayPalPaymentAdapter`, `MockPaymentProvider`) without requiring modifications to core `PaymentService` domain logic.

### L — Liskov Substitution Principle (LSP)
- **Payment Provider Implementations**: Any class implementing `PaymentProvider` (`MockPaymentProvider`, `StripeAdapter`) can be substituted into `PaymentService` without breaking payment contract invariants.

### I — Interface Segregation Principle (ISP)
- Repository interfaces (`InventoryRepository`, `PaymentRepository`, `OrderRepository`) extend focused Spring Data `JpaRepository` contracts rather than monolithic fat interfaces.

### D — Dependency Inversion Principle (DIP)
- **`PaymentService`** depends on high-level abstraction `PaymentProvider` interface rather than concrete low-level payment SDK implementations.

---

## 2. Design Patterns Code Mapping

| Pattern | Component / Java Class | Implementation Detail | Architectural Benefit |
| :--- | :--- | :--- | :--- |
| **Strategy Pattern** | `PaymentProvider` & `MockPaymentProvider` | Swappable payment authorization algorithms via dependency injection. | Decouples banking gateway APIs from internal transaction logic. |
| **Transactional Outbox Pattern** | `PaymentService` & `PaymentOutboxRepository` | Saves domain event to `payment_outbox` table in the SAME database transaction as `Payment`. | Prevents lost events if message broker fails during payment. |
| **State Pattern** | `OrderStatus` Enum | Enforces valid state transitions (`canTransitionTo()`). | Prevents illegal state jumps (e.g. `CREATED` straight to `DELIVERED`). |
| **Factory Pattern** | `PaymentProviderFactory` | Instantiates appropriate `PaymentProvider` adapter based on customer payment method. | Encapsulates adapter instantiation logic. |
| **Repository Pattern** | `InventoryRepository`, `OrderRepository` | Abstracts PostgreSQL database access behind domain repository interfaces. | Encapsulates SQL queries and JPA ORM mapping. |
| **Adapter Pattern** | `MockPaymentProvider` | Adapts simulated test responses into standardized `ProviderResponse` DTO. | Normalizes external API payloads. |
