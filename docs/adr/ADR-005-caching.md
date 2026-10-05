# ADR-005: Parameter-Aware Redis Caching Strategy

## Context
Search queries contain multiple dynamic parameters (q, category, brand, price range, sorting, pagination). Generic cache keys lead to stale or incorrect search results.

## Decision
Construct deterministic cache keys incorporating ALL search parameters:
`search:q=running:cat=footwear:brand=Nike:min=1000:max=5000:sort=price_asc:p=1:s=20`

Set cache TTL to 300 seconds (5 minutes) with Cache-Aside pattern.

## Consequences
Achieves high cache hit rates for popular search queries while eliminating cache pollution.
