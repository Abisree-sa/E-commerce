# SALESTORM — LLD TRACEABILITY MATRIX

This matrix provides 100% end-to-end traceability from top-level Business Requirement down to concrete Java methods, database columns, REST APIs, domain events, and automated test cases.

| Business Requirement | System Feature | HLD Service | LLD Component | Class | Method | Attribute | DB Table.Column | API / Event | Automated Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0 Overselling Invariant** | Atomic Stock Reservation | Inventory Service | Concurrency Engine | `InventoryService` | `reserveInventory()` | `availableQuantity` | `INVENTORY.available_quantity` | `POST /api/v1/reservations` | `FlashSaleConcurrencyTest` |
| **Request Idempotency** | Idempotency Key Guard | Inventory Service | Idempotency Guard | `InventoryService` | `reserveInventory()` | `idempotencyKey` | `INVENTORY_RESERVATION.idempotency_key` | `Header: Idempotency-Key` | `FailureRecoveryTests.testReservationIdempotency` |
| **Durable Payment Outbox** | Transactional Outbox | Payment Service | Payment Processor | `PaymentService` | `processPayment()` | `paymentId` | `PAYMENT_OUTBOX.payment_id` | `PaymentSucceeded Event` | `FailureRecoveryTests.testOutboxEventDurability` |
| **Outage Self-Healing** | Order Recovery | Order Service | Event Consumer | `OrderService` | `createOrderFromPayment()` | `paymentId` | `ORDERS.payment_id` | `PaymentSucceeded Event` | `FailureRecoveryTests.testOrderRecoveryFromPaymentOutage` |
| **State Machine Control** | Order State Lifecycle | Order Service | State Machine | `OrderService` | `updateOrderStatus()` | `status` | `ORDERS.status` | `OrderStatus.CONFIRMED` | `OrderServiceTest.testValidStateTransitions` |
| **Cache-Aside Search** | Redis Catalog Caching | Search Service | Cache Manager | `SearchService` | `searchProducts()` | `redisKey` | `Redis search:catalog:*` | `GET /api/v1/search` | `SearchServiceTest.testCacheHitAndMiss` |
| **Cache Invalidation** | Outbox Invalidation | Search / Product | Cache Evictor | `SearchService` | `handleProductUpdated()` | `productId` | `PRODUCT_OUTBOX.payload` | `ProductUpdated Event` | `SearchServiceTest.testCacheInvalidation` |
| **Reservation Expiry** | Background Release | Inventory Service | Expiry Worker | `InventoryService` | `expireReservations()` | `expiresAt` | `INVENTORY_RESERVATION.expires_at` | `@Scheduled Worker` | `InventoryServiceTest.testReservationExpiry` |
