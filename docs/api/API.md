# SALESTORM OpenAPI 3.0 API Specification

## 1. Product Search Endpoint

```http
GET /api/v1/search
```

### Query Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `q` | string | Full-text search keyword |
| `category` | string | Product category filter |
| `brand` | string | Brand filter |
| `minPrice` | number | Minimum price limit |
| `maxPrice` | number | Maximum price limit |
| `rating` | number | Minimum star rating |
| `sort` | string | `relevance`, `price_asc`, `price_desc`, `rating_desc` |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Items per page (default: 20) |

---

## 2. Inventory Reservation Endpoint

```http
POST /api/v1/reservations
Idempotency-Key: ABC-123
```

### Request Body
```json
{
  "productId": "prod_flash_1",
  "customerId": "cust_101",
  "quantity": 1
}
```

### Success Response (201 Created)
```json
{
  "reservationId": "res_8a7f9b2c",
  "productId": "prod_flash_1",
  "customerId": "cust_101",
  "quantity": 1,
  "status": "RESERVED",
  "idempotencyKey": "ABC-123",
  "expiresAt": "2026-10-05T11:00:00Z"
}
```

### Out of Stock Response (409 Conflict)
```json
{
  "error": "OUT_OF_STOCK",
  "message": "Out of stock for product prod_flash_1"
}
```

---

## 3. Flash Checkout Endpoint

```http
POST /api/v1/checkout
Idempotency-Key: CHK-9901
```

### Request Body
```json
{
  "customerId": "cust_101",
  "productId": "prod_flash_1",
  "productName": "SALESTORM Ultra Edition Pro 15",
  "quantity": 1,
  "amount": 1299.99,
  "shippingAddress": "123 Tech Way",
  "simulateFailure": false,
  "simulateTimeout": false
}
```
