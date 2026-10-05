# ADR-001: OpenSearch Read-Model Indexing Architecture

## Context
High query volume during flash sales requires sub-10ms search response times across millions of products without placing read load on the transactional Product PostgreSQL database.

## Decision
Adopt OpenSearch as a CQRS read model, updated asynchronously via Kafka product events emitted from a transactional Outbox.

## Alternatives Considered
- Direct SQL `LIKE` queries against PostgreSQL (rejected due to database CPU saturation under load).
- Synchronous indexing during product creation (rejected due to network latency and tight coupling).

## Trade-offs & Consequences
- **Pros**: Sub-millisecond full-text search, multi-facet filtering, scale independence.
- **Cons**: Eventual consistency between Product DB and OpenSearch (mitigated by version numbers on events).
