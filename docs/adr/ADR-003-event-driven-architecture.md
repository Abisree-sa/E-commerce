# ADR-003: Transactional Outbox Pattern for Event-Driven Reliability

## Context
Publishing Kafka events directly inside API methods creates a dual-write problem: database commit can succeed while Kafka publish fails, or vice versa, causing event loss or phantom events.

## Decision
Implement the **Transactional Outbox Pattern**. Domain state updates and outbox event insertions occur inside the SAME PostgreSQL ACID database transaction. A separate Outbox Publisher polls pending outbox entries and publishes them to Kafka.

## Consequences
Guarantees at-least-once event delivery to Kafka. Order Service consumes `PaymentSucceeded` events durably even if Order Service was offline when payment occurred.
