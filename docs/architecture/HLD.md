# SALESTORM High-Level Architecture (HLD)

## 1. System Overview

SALESTORM is an enterprise-grade flash-sale platform designed to process **10,000+ concurrent purchase attempts** against extremely constrained inventory (e.g. 100 units) with **ZERO overselling**.

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    Client["React + Vite Frontend"]
    CDN["CDN / Edge Cache"]
    WAF["WAF & Security Layer"]
    LB["Load Balancer"]
    GW["API Gateway / Netty Reverse Proxy"]
    
    Client --> CDN --> WAF --> LB --> GW
    
    GW --> ProductSvc["Product Service"]
    GW --> SearchSvc["Search Service"]
    GW --> RecSvc["Recommendation Service"]
    GW --> CartSvc["Cart Service"]
    GW --> CheckoutSvc["Checkout Service"]
    GW --> InventorySvc["Inventory Service"]
    GW --> PaymentSvc["Payment Service"]
    GW --> OrderSvc["Order Service"]
    
    ProductSvc --> ProductDB[("Product DB (Postgres)")]
    InventorySvc --> InventoryDB[("Inventory DB (Postgres)")]
    PaymentSvc --> PaymentDB[("Payment DB (Postgres)")]
    OrderSvc --> OrderDB[("Order DB (Postgres)")]
    
    SearchSvc --> RedisCache[("Redis Cache")]
    SearchSvc --> OpenSearch[("OpenSearch Index")]
    RecSvc --> RedisCache
    
    ProductSvc -. "Outbox Event" .-> Kafka["Kafka Event Bus"]
    PaymentSvc -. "PaymentSucceeded" .-> Kafka
    Kafka --> IndexWorker["OpenSearch Index Worker"]
    Kafka --> OrderSvc
```

## 3. Core Microservices

| Service | Primary Responsibility | Data Store |
| :--- | :--- | :--- |
| **API Gateway** | Routing, rate limiting, request validation | In-memory token bucket |
| **Product Service** | Authoritative product catalog & outbox events | PostgreSQL (`salestorm_product`) |
| **Search Service** | Read-model search, filter, sort, pagination | OpenSearch + Redis |
| **Inventory Service** | Atomic SQL stock reservation & 10m TTL expiry | PostgreSQL (`salestorm_inventory`) |
| **Payment Service** | Idempotent payment charges & timeout reconciliation | PostgreSQL (`salestorm_payment`) |
| **Order Service** | Order lifecycle state machine & event consumer | PostgreSQL (`salestorm_order`) |
| **Recommendation Service** | Weighted recommendation scoring algorithm | Redis |
