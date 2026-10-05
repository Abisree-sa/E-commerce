# ADR-005: Synchronous vs. Asynchronous Communication Selection

## Context
Choosing between HTTP REST and Kafka Messaging across microservice interactions.

## Decision
- **Synchronous REST**: Used for immediate user-facing reads and stock reservations (`Search`, `Cart`, `Reservation`, `Payment Initiation`).
- **Asynchronous Kafka Events + Transactional Outbox**: Used for event publishing (`ProductCreated`, `PaymentSucceeded`, `OrderCreated`).

## Consequences
Decouples Payment Service from Order Service downtime; guarantees zero event loss via transactional outboxes.
