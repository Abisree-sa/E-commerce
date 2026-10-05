# Reservation State Lifecycle Diagram

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Initial Stock Seeded
    
    AVAILABLE --> RESERVED : POST /reservations (Atomic SQL update succeeded)
    AVAILABLE --> [*] : Out of Stock (409 Conflict)

    RESERVED --> PAYMENT_PENDING : Checkout Initiated
    RESERVED --> RELEASED : Reservation Expired (10m TTL) / Payment Declined
    
    PAYMENT_PENDING --> CONFIRMED : Payment SUCCESS (Stock converted to SOLD)
    PAYMENT_PENDING --> RELEASED : Payment FAILED (Stock returned to AVAILABLE)
    PAYMENT_PENDING --> EXPIRED : TTL Timeout Exceeded

    CONFIRMED --> [*] : Final State (Order Processed)
    RELEASED --> AVAILABLE : Stock Restored to Available Quantity
    EXPIRED --> RELEASED : Expiry Worker Triggered
```

## State Descriptions
1. **AVAILABLE**: Stock is available for reservation in PostgreSQL inventory table (`available_quantity > 0`).
2. **RESERVED**: Stock atomically reserved for a customer with an expiration timestamp (`expires_at = now + 10m`).
3. **PAYMENT_PENDING**: Customer initiated payment gateway charge.
4. **CONFIRMED**: Payment approved. Reserved quantity converted to `sold_quantity`.
5. **RELEASED / EXPIRED**: Payment failed or 10-minute TTL expired. Stock returned atomically to `available_quantity`.
