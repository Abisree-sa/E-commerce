# ADR-003: Redis Caching Strategy & Graceful Degradation

## Context
High query traffic on product searches and details can overload database connection pools.

## Decision
Utilize **Redis 7** as a Cache-Aside layer for search queries (`GET /api/v1/search`) and product details (`GET /api/v1/products/{id}`).
- **Cache Key Strategy**: Parameter-aware keys (`search:q=...:cat=...:sort=...` and `prod:{id}`).
- **TTL**: 300 seconds (5 minutes).
- **Graceful Fallback**: If Redis becomes unavailable, services catch connection exceptions and query PostgreSQL directly without failing user requests.

## Consequences
Reduces DB query load significantly while ensuring system resilience during cache outages. Inventory state remains 100% database-backed.
