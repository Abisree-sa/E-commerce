const http = require('http');
const url = require('url');

const PORT = 8080;

// ==========================================
// IN-MEMORY HIGH-CONCURRENCY DATABASE STATE
// ==========================================
let products = [
  {
    id: "prod_flash_1",
    name: "SALESTORM Ultra Edition Pro 15",
    description: "Next-generation high performance laptop for gaming and development. 100 Units Flash Sale Exclusive.",
    category: "electronics",
    brand: "SalestormTech",
    price: 1299.99,
    rating: 4.9,
    flashSale: true,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    version: 1
  },
  {
    id: "prod_running_1",
    name: "Nike Air Zoom Flash Running Shoes",
    description: "Ultralight carbon-plate running shoes engineered for peak speed.",
    category: "footwear",
    brand: "Nike",
    price: 199.99,
    rating: 4.8,
    flashSale: true,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    version: 1
  },
  {
    id: "prod_headphones_1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    description: "Industry leading noise canceling headphones with dual processors.",
    category: "electronics",
    brand: "Sony",
    price: 349.99,
    rating: 4.7,
    flashSale: false,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    version: 1
  }
];

let inventory = {
  "prod_flash_1": { productId: "prod_flash_1", availableQuantity: 100, reservedQuantity: 0, soldQuantity: 0, version: 1 },
  "prod_running_1": { productId: "prod_running_1", availableQuantity: 100, reservedQuantity: 0, soldQuantity: 0, version: 1 },
  "prod_headphones_1": { productId: "prod_headphones_1", availableQuantity: 500, reservedQuantity: 0, soldQuantity: 0, version: 1 }
};

let reservations = {}; // idempotencyKey -> Reservation
let payments = {};     // idempotencyKey / paymentId -> Payment
let orders = [];       // List of Orders
let carts = {};        // customerId -> Cart
let searchCache = {};  // cacheKey -> SearchResponse

let orderServiceActive = true;

// Helper JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
  });
  res.end(JSON.stringify(data));
}

// ==========================================
// HTTP SERVER IMPLEMENTATION
// ==========================================
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight OPTIONS
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    });
    return res.end();
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload = {};
    if (body) {
      try { payload = JSON.parse(body); } catch (e) {}
    }

    // Router
    try {
      // 1. Search Engine
      if (path === '/api/v1/search' && method === 'GET') {
        const { q, category, brand, minPrice, maxPrice, sort, page = 1, size = 20 } = parsedUrl.query;
        const cacheKey = `search:q=${q||''}:cat=${category||''}:brand=${brand||''}:min=${minPrice||''}:max=${maxPrice||''}:sort=${sort||''}:p=${page}`;

        if (searchCache[cacheKey]) {
          return sendJson(res, 200, { ...searchCache[cacheKey], cached: true, cacheKey });
        }

        let filtered = products.filter(p => {
          if (q && !p.name.toLowerCase().includes(q.toLowerCase()) && !p.description.toLowerCase().includes(q.toLowerCase())) return false;
          if (category && p.category.toLowerCase() !== category.toLowerCase()) return false;
          if (brand && p.brand.toLowerCase() !== brand.toLowerCase()) return false;
          if (minPrice && p.price < Number(minPrice)) return false;
          if (maxPrice && p.price > Number(maxPrice)) return false;
          return true;
        });

        if (sort === 'price_asc') filtered.sort((a,b) => a.price - b.price);
        if (sort === 'price_desc') filtered.sort((a,b) => b.price - a.price);
        if (sort === 'rating_desc') filtered.sort((a,b) => b.rating - a.rating);

        const responseData = {
          items: filtered.map(p => ({ ...p, availableQuantity: inventory[p.id]?.availableQuantity ?? 100 })),
          totalHits: filtered.length,
          page: Number(page),
          size: Number(size),
          totalPages: Math.ceil(filtered.length / size),
          cached: false,
          cacheKey
        };

        searchCache[cacheKey] = responseData;
        return sendJson(res, 200, responseData);
      }

      // 2. Products
      if (path === '/api/v1/products' && method === 'GET') {
        return sendJson(res, 200, products);
      }
      if (path.startsWith('/api/v1/products/') && method === 'GET') {
        const id = path.split('/')[4];
        const p = products.find(x => x.id === id);
        return p ? sendJson(res, 200, p) : sendJson(res, 404, { error: "NOT_FOUND" });
      }

      // 3. Inventory & Seed
      if (path.startsWith('/api/v1/inventory/') && path.endsWith('/seed') && method === 'POST') {
        const productId = path.split('/')[4];
        const stock = Number(parsedUrl.query.stock || 100);
        inventory[productId] = { productId, availableQuantity: stock, reservedQuantity: 0, soldQuantity: 0, version: (inventory[productId]?.version || 0) + 1 };
        return sendJson(res, 200, inventory[productId]);
      }
      if (path.startsWith('/api/v1/inventory/') && method === 'GET') {
        const productId = path.split('/')[4];
        const inv = inventory[productId] || { productId, availableQuantity: 100, reservedQuantity: 0, soldQuantity: 0, version: 1 };
        return sendJson(res, 200, inv);
      }

      // 4. Reservations (ATOMIC OVERSELLING INVARIANT ENFORCED)
      if (path === '/api/v1/reservations' && method === 'POST') {
        const idempotencyKey = req.headers['idempotency-key'] || payload.idempotencyKey || `idem_${Date.now()}`;
        if (reservations[idempotencyKey]) {
          return sendJson(res, 200, reservations[idempotencyKey]); // Idempotent Hit
        }

        const productId = payload.productId || "prod_flash_1";
        const quantity = payload.quantity || 1;
        const inv = inventory[productId] || { productId, availableQuantity: 100, reservedQuantity: 0, soldQuantity: 0, version: 1 };

        // ATOMIC CONDITIONAL CHECK: available_quantity >= quantity
        if (inv.availableQuantity >= quantity) {
          inv.availableQuantity -= quantity;
          inv.reservedQuantity += quantity;
          inv.version += 1;

          const resObj = {
            reservationId: "res_" + Math.random().toString(36).substring(2, 9),
            productId,
            customerId: payload.customerId || "cust_demo",
            quantity,
            status: "RESERVED",
            idempotencyKey,
            expiresAt: new Date(Date.now() + 600000).toISOString()
          };
          reservations[idempotencyKey] = resObj;
          return sendJson(res, 201, resObj);
        } else {
          return sendJson(res, 409, { error: "OUT_OF_STOCK", message: `Out of stock for product ${productId}` });
        }
      }

      // 5. Checkout Orchestrator
      if (path === '/api/v1/checkout' && method === 'POST') {
        const idempotencyKey = req.headers['idempotency-key'] || `chk_idem_${Date.now()}`;
        const productId = payload.productId || "prod_flash_1";
        const quantity = payload.quantity || 1;
        const inv = inventory[productId] || { productId, availableQuantity: 100, reservedQuantity: 0, soldQuantity: 0, version: 1 };

        if (inv.availableQuantity < quantity) {
          return sendJson(res, 200, {
            checkoutId: "chk_" + Math.random().toString(36).substring(2, 9),
            status: "OUT_OF_STOCK",
            message: "Flash sale item is out of stock!",
            idempotencyKey
          });
        }

        // Reserve stock
        inv.availableQuantity -= quantity;
        inv.reservedQuantity += quantity;

        const resId = "res_" + Math.random().toString(36).substring(2, 9);
        const payId = "pay_" + Math.random().toString(36).substring(2, 9);

        if (payload.simulateFailure) {
          // Release stock back
          inv.availableQuantity += quantity;
          inv.reservedQuantity -= quantity;
          return sendJson(res, 200, {
            checkoutId: "chk_" + Math.random().toString(36).substring(2, 9),
            reservationId: resId,
            paymentId: payId,
            status: "PAYMENT_FAILED",
            message: "Payment was declined: Insufficient funds or card declined",
            idempotencyKey
          });
        }

        if (payload.simulateTimeout) {
          return sendJson(res, 200, {
            checkoutId: "chk_" + Math.random().toString(36).substring(2, 9),
            reservationId: resId,
            paymentId: payId,
            status: "RECONCILIATION_PENDING",
            message: "Payment connection timed out. System is reconciling with gateway.",
            idempotencyKey
          });
        }

        // Confirm stock (RESERVED -> SOLD)
        inv.reservedQuantity -= quantity;
        inv.soldQuantity += quantity;

        const orderId = "ord_" + Math.random().toString(36).substring(2, 9);
        const orderObj = {
          orderId,
          paymentId: payId,
          reservationId: resId,
          customerId: payload.customerId || "cust_demo",
          totalAmount: payload.amount || 199.99,
          status: "CONFIRMED",
          shippingAddress: payload.shippingAddress || "123 Innovation Way, Tech City",
          createdAt: new Date().toISOString()
        };
        orders.unshift(orderObj);

        return sendJson(res, 200, {
          checkoutId: "chk_" + Math.random().toString(36).substring(2, 9),
          reservationId: resId,
          paymentId: payId,
          orderId,
          status: "SUCCESS",
          message: "Checkout completed successfully! Order confirmed.",
          totalAmount: payload.amount || 199.99,
          idempotencyKey
        });
      }

      // 6. Orders
      if (path === '/api/v1/orders' && method === 'GET') {
        return sendJson(res, 200, orders);
      }

      // 7. Recommendations
      if (path === '/api/v1/recommendations' && method === 'GET') {
        const recs = [
          { productId: "prod_nike_air", name: "Nike Air Zoom Flash", category: "footwear", brand: "Nike", price: 149.99, recommendationScore: 0.92, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80" },
          { productId: "prod_adidas_ultraboost", name: "Adidas Ultraboost 22", category: "footwear", brand: "Adidas", price: 180.00, recommendationScore: 0.86, imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=80" },
          { productId: "prod_apple_watch", name: "Apple Watch Ultra Flash Edition", category: "electronics", brand: "Apple", price: 799.00, recommendationScore: 0.81, imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80" },
          { productId: "prod_sony_headphones", name: "Sony WH-1000XM5 Noise Canceling", category: "electronics", brand: "Sony", price: 399.99, recommendationScore: 0.78, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80" }
        ];
        return sendJson(res, 200, recs);
      }

      // 8. Carts
      if (path.startsWith('/api/v1/carts/') && method === 'GET') {
        const customerId = path.split('/')[4];
        if (!carts[customerId]) carts[customerId] = { cartId: "cart_demo", customerId, items: [], totalPrice: 0 };
        return sendJson(res, 200, carts[customerId]);
      }
      if (path.startsWith('/api/v1/carts/') && path.endsWith('/items') && method === 'POST') {
        const customerId = path.split('/')[4];
        if (!carts[customerId]) carts[customerId] = { cartId: "cart_demo", customerId, items: [], totalPrice: 0 };
        carts[customerId].items.push(payload);
        carts[customerId].totalPrice = carts[customerId].items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
        return sendJson(res, 200, carts[customerId]);
      }

      // 9. Demo Simulation Endpoints
      if (path === '/api/v1/demo/simulate-flash-sale' && method === 'POST') {
        const productId = parsedUrl.query.productId || "prod_flash_1";
        const initialStock = Number(parsedUrl.query.initialStock || 100);
        const requests = Number(parsedUrl.query.requests || 10000);

        // Reset inventory to initial stock
        inventory[productId] = { productId, availableQuantity: initialStock, reservedQuantity: 0, soldQuantity: 0, version: 1 };

        let successfulReservations = 0;
        let outOfStockCount = 0;
        const start = Date.now();

        for (let i = 0; i < requests; i++) {
          if (inventory[productId].availableQuantity >= 1) {
            inventory[productId].availableQuantity -= 1;
            inventory[productId].reservedQuantity += 1;
            successfulReservations++;
          } else {
            outOfStockCount++;
          }
        }

        const duration = Date.now() - start;
        const inv = inventory[productId];

        return sendJson(res, 200, {
          totalRequests: requests,
          initialStock,
          successfulReservations,
          outOfStockCount,
          availableQuantity: inv.availableQuantity,
          reservedQuantity: inv.reservedQuantity,
          soldQuantity: inv.soldQuantity,
          oversold: inv.availableQuantity < 0 ? Math.abs(inv.availableQuantity) : 0,
          executionTimeMs: duration
        });
      }

      if (path === '/api/v1/demo/simulate-payment-failure' && method === 'POST') {
        return sendJson(res, 200, { status: "PAYMENT_FAILED", message: "Payment was declined: Insufficient funds or card declined" });
      }

      if (path === '/api/v1/demo/simulate-payment-timeout' && method === 'POST') {
        return sendJson(res, 200, { status: "RECONCILIATION_PENDING", message: "Payment connection timed out. Background Reconciliation worker active." });
      }

      if (path === '/api/v1/demo/toggle-order-service' && method === 'POST') {
        orderServiceActive = parsedUrl.query.active === 'true';
        return sendJson(res, 200, { orderServiceActive, message: orderServiceActive ? "Order Service is RUNNING" : "Order Service is DOWN (Simulated Outage)" });
      }

      if (path === '/api/v1/demo/expire-reservations' && method === 'POST') {
        Object.keys(inventory).forEach(k => {
          inventory[k].availableQuantity += inventory[k].reservedQuantity;
          inventory[k].reservedQuantity = 0;
        });
        return sendJson(res, 200, { message: "Triggered reservation expiry worker. Expired stock released to available pool." });
      }

      return sendJson(res, 404, { error: "NOT_FOUND", path });
    } catch (err) {
      return sendJson(res, 500, { error: "SERVER_ERROR", message: err.message });
    }
  });
});

server.listen(PORT, () => {
  console.log('=================================================================');
  console.log(`  SALESTORM BACKEND SERVICE ENGINE RUNNING AT http://localhost:${PORT}`);
  console.log('=================================================================');
});
