# SALESTORM System Context Diagram (C4 Level 1)

## System Context Diagram

```mermaid
C4Context
    title System Context Diagram for SALESTORM Platform

    Person(customer, "Customer", "E-commerce user purchasing products during flash sales.")
    Person(admin, "System Administrator", "Monitors stock, concurrency metrics, and failure recovery.")
    
    System(salestorm, "SALESTORM Platform", "High-concurrency e-commerce flash-sale engine ensuring zero overselling.")

    System_Ext(payment_gateway, "Payment Provider", "Processes credit card and digital wallet transactions.")
    System_Ext(delivery_partner, "Delivery Partner Logistics", "Handles package shipment and tracking.")
    System_Ext(notification_provider, "Notification Provider", "Sends SMS and Email order updates.")

    Rel(customer, salestorm, "Searches catalog, places orders, reserves flash stock", "HTTPS/REST")
    Rel(admin, salestorm, "Monitors metrics, triggers simulations, reconciles timeouts", "HTTPS/REST")

    Rel(salestorm, payment_gateway, "Authorizes and captures payments", "HTTPS/REST")
    Rel(salestorm, delivery_partner, "Dispatches shipment tracking requests", "HTTPS/REST")
    Rel(salestorm, notification_provider, "Dispatches order emails/SMS", "SMTP/REST")
```

## System Boundaries & Interaction Description
- **Customer**: Interacts synchronously via HTTPS for search, cart management, inventory reservation, and checkout.
- **Payment Provider**: External payment gateway (simulated via `MockPaymentProvider` with timeout reconciliation).
- **Delivery Partner**: External logistics API for shipment creation.
- **Notification Provider**: Email/SMS notifications triggered asynchronously via domain events.
