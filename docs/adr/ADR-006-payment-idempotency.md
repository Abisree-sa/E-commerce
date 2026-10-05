# ADR-006: Payment Idempotency & Deduplication

## Context
Network retries can resend payment requests, risking double-charging users.

## Decision
Mandate `Idempotency-Key` headers on all mutating POST requests. Store idempotency keys in PostgreSQL tables with `UNIQUE(idempotency_key)` and `UNIQUE(transaction_reference)` constraints.

## Consequences
Guarantees repeat requests return original payment objects without re-charging cards.
