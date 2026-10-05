# ADR-001: Microservices Architecture Selection

## Context
SALESTORM must handle high query traffic and sudden flash-sale traffic spikes across distinct domain boundaries (Catalog, Inventory, Payments, Orders) without single-point-of-failure bottlenecks.

## Decision
Adopt a **Microservices Architecture** with 6 domain services (`Product`, `Search`, `Inventory`, `Payment`, `Order`, `Recommendation`) behind an API Gateway.

## Alternatives
- Monolithic Architecture: Rejected due to inability to scale inventory reservation independently from catalog searches.
- Serverless Functions: Rejected due to cold-start latency spikes during 10,000-request flash sale bursts.

## Trade-offs & Consequences
- **Pros**: Independent scaling, deployment isolation, fault containment.
- **Cons**: Distributed system complexity, requires event-driven eventual consistency.
