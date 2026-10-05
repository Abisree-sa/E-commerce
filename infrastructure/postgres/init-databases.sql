-- SALESTORM Official Syscrafters 2026 Database Initialization Script
-- Creates isolated logical databases and schemas representing all 15 official entities:
-- CUSTOMER, PRODUCT, CATEGORY, INVENTORY, INVENTORY_RESERVATION, CART, CART_ITEM, ORDER, ORDER_ITEM, PAYMENT, SALE, DEAL, COUPON, SHIPMENT, NOTIFICATION

CREATE DATABASE salestorm_product;
CREATE DATABASE salestorm_inventory;
CREATE DATABASE salestorm_payment;
CREATE DATABASE salestorm_order;

-- ==========================================
-- 1. PRODUCT & CATALOG DATABASE (salestorm_product)
-- ==========================================
\c salestorm_product;

CREATE TABLE IF NOT EXISTS categories (
    category_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id VARCHAR(64) REFERENCES categories(category_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(64) REFERENCES categories(category_id),
    category_name VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    rating DECIMAL(3,2) DEFAULT 4.5,
    is_flash_sale BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(512),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_name);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);

CREATE TABLE IF NOT EXISTS sales (
    sale_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING', -- UPCOMING, ACTIVE, ENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deals (
    deal_id VARCHAR(64) PRIMARY KEY,
    sale_id VARCHAR(64) NOT NULL REFERENCES sales(sale_id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL,
    discount_price DECIMAL(12,2) NOT NULL,
    max_quantity INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS coupons (
    coupon_id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_outbox (
    id VARCHAR(64) PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. INVENTORY DATABASE (salestorm_inventory)
-- ==========================================
\c salestorm_inventory;

CREATE TABLE IF NOT EXISTS inventory (
    inventory_id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL UNIQUE,
    available_quantity INT NOT NULL CHECK (available_quantity >= 0), -- CRITICAL INVARIANT GUARD
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    sold_quantity INT NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0),
    version INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_reservations (
    reservation_id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    status VARCHAR(30) NOT NULL, -- AVAILABLE, RESERVED, PAYMENT_PENDING, CONFIRMED, RELEASED, EXPIRED
    idempotency_key VARCHAR(128) NOT NULL UNIQUE, -- IDEMPOTENCY SAFETY GUARD
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EXPIRES_AT + STATUS COMPOUND INDEX FOR FAST EXPIRY WORKER POLLING
CREATE INDEX idx_reservations_expires_status ON inventory_reservations(expires_at, status);
CREATE INDEX idx_reservations_product_id ON inventory_reservations(product_id);

-- ==========================================
-- 3. PAYMENT DATABASE (salestorm_payment)
-- ==========================================
\c salestorm_payment;

CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(64) PRIMARY KEY,
    reservation_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL, -- INITIATED, PROCESSING, SUCCESS, FAILED, UNKNOWN
    transaction_reference VARCHAR(128) NOT NULL UNIQUE, -- DEDUPLICATION GUARD
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,       -- IDEMPOTENCY GUARD
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS payment_outbox (
    id VARCHAR(64) PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. ORDER DATABASE (salestorm_order)
-- ==========================================
\c salestorm_order;

CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carts (
    cart_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(64) PRIMARY KEY,
    cart_id VARCHAR(64) NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL UNIQUE, -- CRITICAL 1-TO-1 DEDUPLICATION GUARD
    reservation_id VARCHAR(64) NOT NULL,
    customer_id VARCHAR(64) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL, -- CREATED, PAYMENT_PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS shipments (
    shipment_id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    carrier VARCHAR(100) NOT NULL,
    tracking_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL, -- PREPARING, SHIPPED, IN_TRANSIT, DELIVERED
    shipped_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    channel VARCHAR(30) NOT NULL, -- EMAIL, SMS, PUSH
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'SENT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
