# INVENTORY SERVICE — DATABASE & ATTRIBUTE MAPPING

## 1. Table Schema: `INVENTORY`

```sql
CREATE TABLE inventory (
    product_id VARCHAR(64) PRIMARY KEY,
    available_quantity INT NOT NULL CHECK (available_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    sold_quantity INT NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Table Schema: `INVENTORY_RESERVATION`

```sql
CREATE TABLE inventory_reservation (
    reservation_id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL REFERENCES inventory(product_id),
    customer_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(32) NOT NULL DEFAULT 'RESERVED',
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_reservation_idempotency_key ON inventory_reservation(idempotency_key);
CREATE INDEX idx_reservation_expires_at ON inventory_reservation(expires_at, status);
```

---

## 3. Attribute Attribute Mapping Matrix

| DB Column | JPA Field (`Inventory.java`) | Type | Constraint | Business Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `product_id` | `Inventory.productId` | `String` | `PRIMARY KEY` | Unique SKU identifier |
| `available_quantity` | `Inventory.availableQuantity` | `int` | `>= 0` | Available stock pool for flash sale locking |
| `reserved_quantity` | `Inventory.reservedQuantity` | `int` | `>= 0` | Locked stock under 10-min reservation hold |
| `sold_quantity` | `Inventory.soldQuantity` | `int` | `>= 0` | Confirmed sold stock after payment confirmation |
| `version` | `Inventory.version` | `int` | `Optimistic Lock` | Concurrency version counter |
