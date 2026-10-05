# SALESTORM — LOW LEVEL DESIGN (LLD) MASTER SPECIFICATION

> **System Core Invariant**:  
> **SUCCESSFUL RESERVATIONS MUST NEVER EXCEED AVAILABLE INVENTORY.**  
> *(Proved under 10,000 concurrent purchase attempts against 100 stock units with 0 overselling).*

---

## 1. Architectural Hierarchy & Traceability

The Low-Level Design (LLD) serves as the direct, code-level execution model of the SALESTORM High-Level Architecture (HLD).

```text
BUSINESS REQUIREMENT
        ↓
FEATURE
        ↓
HLD SERVICE
        ↓
LLD COMPONENT
        ↓
CLASS
        ↓
INTERFACE
        ↓
METHOD
        ↓
ATTRIBUTE
        ↓
DATABASE TABLE/COLUMN
        ↓
API / EVENT
        ↓
TRANSACTION
        ↓
ACTUAL SPRING BOOT CODE
        ↓
TEST
```

---

## 2. Low-Level Microservices & Component Breakdown

SALESTORM implements standard Tiered Spring Boot Microservice architecture:

1. **Inventory Service** (`com.salestorm.inventory`):
   - `InventoryController`: Handles `POST /api/v1/reservations` REST calls.
   - `InventoryService`: Manages `@Transactional` reservation boundaries, idempotency, and background expiry cleanup.
   - `InventoryRepository`: Executes atomic conditional SQL updates (`WHERE available_quantity >= :qty`).
   - `ReservationRepository`: Idempotency key lookup and persistence of `INVENTORY_RESERVATION` entities.

2. **Payment Service** (`com.salestorm.payment`):
   - `PaymentController`: Handles `POST /api/v1/payments` REST charges.
   - `PaymentService`: Idempotent payment processor emitting durable outbox events into `PAYMENT_OUTBOX`.
   - `PaymentProvider`: Strategy Pattern interface for mock gateway and real card processors.
   - `PaymentOutboxRepository`: Outbox event storage ensuring zero lost payment events.

3. **Order Service** (`com.salestorm.order`):
   - `OrderService`: Consumes `PaymentSucceeded` outbox events and enforces `UNIQUE(payment_id)`.
   - `OrderRepository`: Manages `ORDERS` and `ORDER_ITEM` JPA entities.
   - `OrderStatus`: Enum state machine (`CREATED → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`).

4. **Product Service** (`com.salestorm.product`):
   - `ProductService`: Catalog CRUD operations publishing `ProductUpdated` outbox events for search cache invalidation.

5. **Search Service** (`com.salestorm.search`):
   - `SearchService`: Cache-Aside search queries backed by Redis Cluster with fallback to PostgreSQL.

---

## 3. Database Entity ↔ JPA Entity Mapping

SALESTORM implements 15 isolated domain entities:

| Database Table | JPA Entity Class | Package | Primary Key | Key Indexes & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `INVENTORY` | `Inventory.java` | `com.salestorm.inventory.model` | `product_id` | `CHECK (available_quantity >= 0)` |
| `INVENTORY_RESERVATION` | `Reservation.java` | `com.salestorm.inventory.model` | `reservation_id` | `UNIQUE(idempotency_key)` |
| `PAYMENT` | `Payment.java` | `com.salestorm.payment.model` | `payment_id` | `UNIQUE(idempotency_key)` |
| `PAYMENT_OUTBOX` | `PaymentOutbox.java` | `com.salestorm.payment.model` | `id` | `idx_processed` |
| `ORDERS` | `Order.java` | `com.salestorm.order.model` | `order_id` | `UNIQUE(payment_id)` |
| `ORDER_ITEM` | `OrderItem.java` | `com.salestorm.order.model` | `id` | `FK -> ORDERS` |
| `PRODUCT` | `Product.java` | `com.salestorm.product.model` | `product_id` | `idx_category` |
| `PRODUCT_OUTBOX` | `ProductOutbox.java` | `com.salestorm.product.model` | `id` | `idx_processed` |
| `CUSTOMER` | `Customer.java` | `com.salestorm.customer.model` | `customer_id` | `UNIQUE(email)` |
| `CART` | `Cart.java` | `com.salestorm.cart.model` | `customer_id` | `FK -> CUSTOMER` |
| `CART_ITEM` | `CartItem.java` | `com.salestorm.cart.model` | `id` | `FK -> CART` |
| `CATEGORY` | `Category.java` | `com.salestorm.product.model` | `category_id` | `idx_parent_id` |
| `SHIPMENT` | `Shipment.java` | `com.salestorm.shipment.model` | `shipment_id` | `FK -> ORDERS` |
| `NOTIFICATION` | `Notification.java` | `com.salestorm.notification.model` | `id` | `idx_customer` |
| `COUPON` | `Coupon.java` | `com.salestorm.deal.model` | `code` | `UNIQUE(code)` |

---

## 4. Interactive LLD Visualizer Integration

The SALESTORM platform includes a live, interactive **LLD Visualizer** built directly into the React SPA frontend.

Access URL: `/lld` or `/architecture/lld`

### Key Navigation Capabilities:
- **60% Left Diagram Canvas**: Renders class diagrams, sequence flows, state machines, and component maps with Zoom, Pan, Fit View, and Fullscreen controls.
- **40% Right Step Workflow Panel**: Displays active step caller, target, Java method signature, validation guards, database/SQL statements, `@Transactional` boundaries, execution results, and architectural rationale ("Why this step exists").
- **Visual Sequence Animation**: Animated packet movement along active edges (`RED` = current step, `PURPLE` = async event, `GREEN` = success, `BLUE` = SQL query).
- **LLD Judge Mode**: Guided 10-step hackathon evaluation tour detailing core concurrency, outbox pattern, failure recovery, and SOLID mapping.
- **Trace Modes**: Interactive inspection for Attributes, Methods, APIs, and Events.
