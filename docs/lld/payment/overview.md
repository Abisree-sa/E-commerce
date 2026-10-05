# PAYMENT SERVICE — LOW LEVEL DESIGN SPECIFICATION

## 1. Module Overview
Payment Service (`com.salestorm.payment`) handles payment authorization with external banking gateways via the Strategy Pattern, enforces request idempotency, and guarantees durable event generation via the Transactional Outbox pattern.

---

## 2. Core Java Components
- **`PaymentController`**: REST endpoint accepting `POST /api/v1/payments`.
- **`PaymentService`**: Main `@Transactional` service executing provider authorization and outbox insertion.
- **`PaymentProvider`**: Strategy Pattern interface abstracting payment gateway logic.
- **`MockPaymentProvider`**: Concrete strategy adapter for simulation and testing.
- **`PaymentRepository`**: Spring Data JPA repository for `PAYMENT` entity.
- **`PaymentOutboxRepository`**: Spring Data JPA repository for `PAYMENT_OUTBOX` table.

---

## 3. Transactional Outbox Pattern Flow

```text
Client
  ↓ (POST /api/v1/payments)
PaymentController
  ↓
PaymentService.processPayment()
  ↓
PaymentProvider.processPayment() [External Gateway Authorization]
  ↓ (Returns SUCCESS)
[SAME RDBMS TRANSACTION]
  ├─> INSERT INTO PAYMENT (status = 'SUCCESS')
  └─> INSERT INTO PAYMENT_OUTBOX (event_type = 'PaymentSucceeded', processed = false)
COMMIT TRANSACTION
```

### Benefit:
If Order Service or message broker is offline, the payment record AND outbox event are stored safely in PostgreSQL. When Order Service recovers, it consumes the unprocessed outbox events and creates the orders reliably.
