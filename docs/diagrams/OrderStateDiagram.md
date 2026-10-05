# Order State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> CREATED : PaymentSucceeded Event Received
    
    CREATED --> PAYMENT_PENDING : Validating Transaction
    CREATED --> CONFIRMED : Automatic Transition upon Payment Success
    CREATED --> CANCELLED : Customer / System Cancellation

    PAYMENT_PENDING --> CONFIRMED : Payment Reconciled & Approved
    PAYMENT_PENDING --> CANCELLED : Payment Reconciled & Failed

    CONFIRMED --> PROCESSING : Warehouse Allocation Initiated
    CONFIRMED --> CANCELLED : Pre-shipment Cancellation

    PROCESSING --> SHIPPED : Dispatch to Delivery Partner
    PROCESSING --> CANCELLED : Fulfillment Failure

    SHIPPED --> OUT_FOR_DELIVERY : Courier Out for Delivery
    OUT_FOR_DELIVERY --> DELIVERED : Package Delivered

    DELIVERED --> [*] : Terminal State
    CANCELLED --> [*] : Terminal State
```

## State Transition Rules (`OrderStatus.java`)
- `CREATED` can transition to: `PAYMENT_PENDING`, `CONFIRMED`, `CANCELLED`.
- `CONFIRMED` can transition to: `PROCESSING`, `CANCELLED`.
- `PROCESSING` can transition to: `SHIPPED`, `CANCELLED`.
- `SHIPPED` can transition to: `OUT_FOR_DELIVERY`.
- `OUT_FOR_DELIVERY` can transition to: `DELIVERED`.
- `DELIVERED` & `CANCELLED` are terminal states (no further transitions allowed). Invalid transitions throw `IllegalStateException`.
