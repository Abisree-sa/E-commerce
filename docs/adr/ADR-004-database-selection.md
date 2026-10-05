# ADR-004: Multi-Database PostgreSQL Architecture

## Context
Microservices require strict data isolation and database boundaries to allow independent scaling, zero cross-domain coupling, and isolated database failures.

## Decision
Utilize PostgreSQL with separate logical databases/schemas for each microservice domain:
- `salestorm_product`
- `salestorm_inventory`
- `salestorm_payment`
- `salestorm_order`

## Consequences
Prevents cross-service SQL joins; enforces event-driven communication and strict API integration boundaries.
