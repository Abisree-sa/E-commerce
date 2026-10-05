# ORDER SERVICE — LOW LEVEL DESIGN SPECIFICATION

## 1. Module Overview
Order Service (`com.salestorm.order`) processes `PaymentSucceeded` events asynchronously, enforces duplicate prevention via `UNIQUE(payment_id)`, and executes valid order state machine transitions.

---

## 2. Core Java Components
- **`OrderService`**: `@Transactional` domain service creating orders from payment outbox events and updating order status.
- **`OrderRepository`**: Manages `ORDERS` entity and `findByPaymentId()` idempotency lookup.
- **`OrderStatus`**: Enum defining valid lifecycle state machine transitions (`canTransitionTo()`).
- **`OrderStateHistory`**: Entity recording audit trail for every state transition.

---

## 3. Order Lifecycle State Machine

```text
[ CREATED ]
     ↓ (PaymentSucceeded Event)
[ CONFIRMED ]
     ↓ (Warehouse Processing)
[ PROCESSING ]
     ↓ (Courier Dispatch)
[ SHIPPED ]
     ↓ (Delivery Confirmation)
[ DELIVERED ]
```

### State Machine Transition Enforcer (`OrderStatus.java`):

```java
public enum OrderStatus {
    CREATED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus next) {
        return switch (this) {
            case CREATED -> next == CONFIRMED || next == CANCELLED;
            case CONFIRMED -> next == PROCESSING || next == CANCELLED;
            case PROCESSING -> next == SHIPPED || next == CANCELLED;
            case SHIPPED -> next == DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };
    }
}
```
