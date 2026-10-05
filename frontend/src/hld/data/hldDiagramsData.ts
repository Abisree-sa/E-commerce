import { HldDiagramData } from '../types';

export const hldDiagramsData: Record<string, HldDiagramData> = {
  'HLD-01': {
    id: 'HLD-01',
    code: 'HLD-01',
    title: 'System Context Diagram',
    subtitle: 'C4 Level 1 — External Actors & System Boundaries',
    description: 'Displays the SALESTORM platform from a high-level external system perspective, showing Customer/Admin actors and external providers (Payment, Delivery, Notifications).',
    nodes: [
      {
        id: 'cust',
        label: 'Customer',
        type: 'client',
        description: 'E-commerce user browsing catalog and purchasing flash sale items.',
        responsibility: 'Initiates product search, cart operations, stock reservations, and payment checkouts.',
        receives: 'Product listings, reservation status, payment confirmation, order tracking.',
        produces: 'HTTP REST search requests, checkout requests, payment details.',
        dataOwnership: 'Customer session credentials & shopping cart intent',
        dependencies: ['salestorm_platform'],
        communication: 'HTTPS / REST API',
        whyItExists: 'Primary end-user actor interacting with the flash sale platform.',
        x: 100, y: 180, width: 140, height: 80
      },
      {
        id: 'admin',
        label: 'System Admin',
        type: 'client',
        description: 'Operations manager monitoring concurrency metrics and triggering simulations.',
        responsibility: 'Seeds stock, triggers flash sale simulations, reconciles timeouts, and monitors server health.',
        receives: 'Real-time telemetry, oversold counts (0), system audit stream.',
        produces: 'Demo control triggers, inventory seed requests, service outage simulation toggles.',
        dataOwnership: 'System configuration & admin overrides',
        dependencies: ['salestorm_platform'],
        communication: 'HTTPS / REST API',
        whyItExists: 'Allows operations teams to manage catalog, inventory, and observe failure recovery live.',
        x: 100, y: 380, width: 140, height: 80
      },
      {
        id: 'salestorm_platform',
        label: 'SALESTORM Platform',
        type: 'service',
        description: 'High-concurrency e-commerce flash sale system ensuring zero overselling.',
        responsibility: 'Orchestrates search caching, atomic inventory locking, idempotent payments, outbox events, and order creation.',
        receives: 'Customer purchase requests, admin control commands, external provider webhooks.',
        produces: 'Search results, reservation locks, payment charges, order confirmations, outbound notifications.',
        dataOwnership: 'System of Record for Catalog, Inventory, Payments, and Orders',
        dependencies: ['payment_gateway', 'delivery_partner', 'notification_provider'],
        communication: 'REST HTTP / Kafka Events / SQL',
        whyItExists: 'The core system boundary encompassing microservices, databases, caches, and message brokers.',
        x: 420, y: 250, width: 220, height: 140
      },
      {
        id: 'payment_gateway',
        label: 'Payment Provider',
        type: 'external',
        description: 'External payment gateway (e.g. Visa/Mastercard/Stripe mock).',
        responsibility: 'Authorizes credit card transactions and returns transaction reference approval.',
        receives: 'Card details, amount, reservation ID, idempotency key.',
        produces: 'Payment approval status (SUCCESS, FAILED, TIMEOUT_UNKNOWN), transaction reference.',
        dataOwnership: 'External banking ledger & card tokenization',
        dependencies: [],
        communication: 'HTTPS REST Webhooks',
        whyItExists: 'Handles real-world monetary authorization securely outside system boundary.',
        x: 780, y: 120, width: 160, height: 80
      },
      {
        id: 'delivery_partner',
        label: 'Delivery Partner',
        type: 'external',
        description: 'External shipping logistics partner (e.g. FedEx / DHL).',
        responsibility: 'Generates shipping labels and updates courier tracking numbers.',
        receives: 'Order ID, package details, customer shipping address.',
        produces: 'Tracking number, shipment state updates (SHIPPED, IN_TRANSIT, DELIVERED).',
        dataOwnership: 'Physical courier logistics network state',
        dependencies: [],
        communication: 'HTTPS REST APIs',
        whyItExists: 'Dispatches physical goods to customers after order confirmation.',
        x: 780, y: 270, width: 160, height: 80
      },
      {
        id: 'notification_provider',
        label: 'Notification Provider',
        type: 'external',
        description: 'External Email & SMS Gateway (e.g. SendGrid / Twilio).',
        responsibility: 'Dispatches order confirmations and flash sale alerts to customer devices.',
        receives: 'Customer phone/email, notification payload message.',
        produces: 'Delivery receipts (SENT, FAILED).',
        dataOwnership: 'SMS/Email gateway transmission logs',
        dependencies: [],
        communication: 'SMTP / REST API',
        whyItExists: 'Communicates order status updates asynchronously to customer devices.',
        x: 780, y: 420, width: 160, height: 80
      }
    ],
    connections: [
      { id: 'c1', source: 'cust', target: 'salestorm_platform', label: 'HTTP REST Queries & Checkout', protocol: 'HTTPS', type: 'sync' },
      { id: 'c2', source: 'admin', target: 'salestorm_platform', label: 'HTTP Admin & Demo Controls', protocol: 'HTTPS', type: 'sync' },
      { id: 'c3', source: 'salestorm_platform', target: 'payment_gateway', label: 'Payment Charge', protocol: 'HTTPS', type: 'sync' },
      { id: 'c4', source: 'salestorm_platform', target: 'delivery_partner', label: 'Dispatch Shipment', protocol: 'HTTPS', type: 'sync' },
      { id: 'c5', source: 'salestorm_platform', target: 'notification_provider', label: 'Send Email / SMS', protocol: 'SMTP', type: 'async' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Product Search & Discovery',
        description: 'Customer searches the SALESTORM catalog for flash-sale products.',
        steps: [
          {
            stepNumber: 1, title: 'Send Search Query', sourceNodeId: 'cust', targetNodeId: 'salestorm_platform',
            action: 'GET /api/v1/search?q=running+shoes', operation: 'HTTP GET', payload: 'q=running+shoes&minPrice=100',
            result: 'Processing Query', packetType: 'request', durationMs: 1000,
            explanation: 'Customer initiates a multi-facet search query for running shoes via HTTPS.'
          },
          {
            stepNumber: 2, title: 'Return Search Results', sourceNodeId: 'salestorm_platform', targetNodeId: 'cust',
            action: '200 OK (Product List)', operation: 'JSON Response', payload: '{ items: [...], totalHits: 42, cached: true }',
            result: 'Results Rendered', packetType: 'response', durationMs: 1000,
            explanation: 'SALESTORM platform returns sub-10ms search results from Redis cache.'
          }
        ]
      },
      {
        id: 's2',
        title: 'End-to-End Flash Sale Checkout',
        description: 'Customer reserves flash stock, pays via payment provider, dispatches shipment and notification.',
        steps: [
          {
            stepNumber: 1, title: 'Initiate Checkout', sourceNodeId: 'cust', targetNodeId: 'salestorm_platform',
            action: 'POST /api/v1/checkout', operation: 'HTTP POST', payload: 'productId=prod_flash_1, qty=1',
            result: 'Stock Reserved', packetType: 'request', durationMs: 800,
            explanation: 'Customer sends checkout request with Idempotency-Key header.'
          },
          {
            stepNumber: 2, title: 'Charge Payment', sourceNodeId: 'salestorm_platform', targetNodeId: 'payment_gateway',
            action: 'Authorize Payment', operation: 'Gateway API', payload: 'amount=$199.99, idempotencyKey=pay_123',
            result: 'APPROVED', packetType: 'query', durationMs: 1200,
            explanation: 'SALESTORM calls external payment provider to authorize card charge.'
          },
          {
            stepNumber: 3, title: 'Payment Approval', sourceNodeId: 'payment_gateway', targetNodeId: 'salestorm_platform',
            action: 'Payment Success', operation: 'API Response', payload: 'txRef=tx_9901, status=SUCCESS',
            result: 'Payment Confirmed', packetType: 'result', durationMs: 800,
            explanation: 'Payment provider returns transaction reference approval.'
          },
          {
            stepNumber: 4, title: 'Create Shipment', sourceNodeId: 'salestorm_platform', targetNodeId: 'delivery_partner',
            action: 'Dispatch Order', operation: 'Logistics API', payload: 'orderId=ord_501, address=123 Way',
            result: 'Tracking Generated', packetType: 'event', durationMs: 1000,
            explanation: 'SALESTORM requests shipment tracking code from delivery partner.'
          },
          {
            stepNumber: 5, title: 'Send Email Notification', sourceNodeId: 'salestorm_platform', targetNodeId: 'notification_provider',
            action: 'Dispatch Confirmation', operation: 'SMTP / API', payload: 'to=customer@email.com, subject=Order Confirmed',
            result: 'Notification Sent', packetType: 'event', durationMs: 800,
            explanation: 'SALESTORM triggers asynchronous email confirmation to customer.'
          }
        ]
      }
    ]
  },

  'HLD-02': {
    id: 'HLD-02',
    code: 'HLD-02',
    title: 'Overall System Architecture',
    subtitle: 'Primary Microservices & Data Flow Overview',
    description: 'Detailed view of the complete architecture: Edge (CDN/WAF), Nginx Load Balancer, API Gateway, Microservices, Redis Cache, PostgreSQL databases, Kafka Event Bus, and OpenSearch Index.',
    nodes: [
      { id: 'client', label: 'React Client App', type: 'client', description: 'Single Page React Application.', responsibility: 'User interface & interaction.', receives: 'API JSON', produces: 'HTTP REST requests', dataOwnership: 'Local state', dependencies: ['cdn_waf'], communication: 'HTTPS', whyItExists: 'Front-end user touchpoint.', x: 50, y: 250, width: 130, height: 70 },
      { id: 'cdn_waf', label: 'CDN / WAF', type: 'cdn', description: 'Edge security & static asset CDN.', responsibility: 'DDoS protection, rate limiting, SSL termination.', receives: 'HTTPS requests', produces: 'Filtered HTTP traffic', dataOwnership: 'Edge cache', dependencies: ['load_balancer'], communication: 'HTTPS', whyItExists: 'Protects backend from volumetric attacks.', x: 210, y: 250, width: 110, height: 70 },
      { id: 'load_balancer', label: 'Nginx Load Balancer', type: 'loadbalancer', description: 'Nginx Reverse Proxy & Load Balancer.', responsibility: 'Distributes traffic round-robin across API Gateway & service instances.', receives: 'Filtered HTTP traffic', produces: 'Balanced HTTP requests', dataOwnership: 'Routing table', dependencies: ['api_gateway'], communication: 'HTTP', whyItExists: 'Horizontal scalability and node failover.', x: 350, y: 250, width: 140, height: 70 },
      { id: 'api_gateway', label: 'API Gateway', type: 'gateway', description: 'Spring Cloud Gateway / Reverse Proxy.', responsibility: 'Token bucket rate limiting, JWT auth, route mapping.', receives: 'Client HTTP requests', produces: 'Internal service calls', dataOwnership: 'Route configuration', dependencies: ['search_svc', 'product_svc', 'inventory_svc', 'payment_svc', 'order_svc'], communication: 'HTTP REST', whyItExists: 'Unified entry point protecting microservice internal mesh.', x: 520, y: 250, width: 130, height: 70 },
      
      { id: 'search_svc', label: 'Search Service', type: 'service', description: 'CQRS Read-model query engine.', responsibility: 'Product search, filtering, sorting, Redis caching.', receives: 'GET /search', produces: 'SearchResponse DTO', dataOwnership: 'Search index cache', dependencies: ['redis', 'opensearch'], communication: 'REST / Redis', whyItExists: 'Sub-10ms query execution.', x: 700, y: 80, width: 130, height: 65 },
      { id: 'product_svc', label: 'Product Service', type: 'service', description: 'Authoritative product catalog.', responsibility: 'Product metadata & Outbox event generation.', receives: 'CRUD product requests', produces: 'ProductOutbox events', dataOwnership: 'salestorm_product DB', dependencies: ['product_db', 'kafka'], communication: 'REST / SQL', whyItExists: 'Source of truth for products.', x: 700, y: 170, width: 130, height: 65 },
      { id: 'inventory_svc', label: 'Inventory Service', type: 'service', description: 'Atomic stock reservation engine.', responsibility: 'Atomic SQL stock decrement & 10m TTL expiry worker.', receives: 'POST /reservations', produces: 'Reservation locks', dataOwnership: 'salestorm_inventory DB', dependencies: ['inventory_db'], communication: 'REST / SQL', whyItExists: 'Guarantees zero overselling.', x: 700, y: 260, width: 130, height: 65 },
      { id: 'payment_svc', label: 'Payment Service', type: 'service', description: 'Idempotent payment processor.', responsibility: 'Charges cards, handles UNKNOWN timeouts, reconciliation, PaymentOutbox.', receives: 'POST /payments', produces: 'PaymentSucceeded events', dataOwnership: 'salestorm_payment DB', dependencies: ['payment_db', 'kafka'], communication: 'REST / SQL', whyItExists: 'Handles payment lifecycle and event durability.', x: 700, y: 350, width: 130, height: 65 },
      { id: 'order_svc', label: 'Order Service', type: 'service', description: 'Order lifecycle state machine.', responsibility: 'Creates orders from PaymentSucceeded Kafka events with UNIQUE(payment_id).', receives: 'PaymentSucceeded events', produces: 'Order state updates', dataOwnership: 'salestorm_order DB', dependencies: ['order_db', 'kafka'], communication: 'REST / SQL / Kafka', whyItExists: 'Manages order state machine and outage recovery.', x: 700, y: 440, width: 130, height: 65 },

      { id: 'redis', label: 'Redis Cache', type: 'cache', description: 'In-memory Cache-Aside store.', responsibility: 'Caches search queries and product details (300s TTL).', receives: 'GET/SET cache keys', produces: 'Cached JSON strings', dataOwnership: 'Transient RAM cache', dependencies: [], communication: 'RESP Protocol', whyItExists: 'Offloads reads from PostgreSQL.', x: 900, y: 80, width: 120, height: 65 },
      { id: 'opensearch', label: 'OpenSearch', type: 'cache', description: 'Full-text search engine index.', responsibility: 'Faceted search & text indexing.', receives: 'Product outbox events', produces: 'Indexed documents', dataOwnership: 'Read index documents', dependencies: [], communication: 'HTTP REST', whyItExists: 'Complex multi-facet search.', x: 900, y: 170, width: 120, height: 65 },
      { id: 'postgres', label: 'PostgreSQL DBs', type: 'database', description: '4 Isolated Logical Databases.', responsibility: 'System of record with check constraints (available >= 0).', receives: 'ACID SQL queries', produces: 'Persisted rows', dataOwnership: 'System of Record', dependencies: [], communication: 'JDBC / SQL', whyItExists: 'Authoritative data persistence.', x: 900, y: 300, width: 130, height: 80 },
      { id: 'kafka', label: 'Kafka Event Bus', type: 'broker', description: 'Distributed Event Bus.', responsibility: 'Durable event log for outbox events.', receives: 'Domain events', produces: 'Consumed event streams', dataOwnership: 'Topic partition logs', dependencies: [], communication: 'Kafka Protocol', whyItExists: 'Asynchronous event-driven decoupling.', x: 900, y: 440, width: 130, height: 65 }
    ],
    connections: [
      { id: 'c1', source: 'client', target: 'cdn_waf', protocol: 'HTTPS', type: 'sync' },
      { id: 'c2', source: 'cdn_waf', target: 'load_balancer', protocol: 'HTTP', type: 'sync' },
      { id: 'c3', source: 'load_balancer', target: 'api_gateway', protocol: 'HTTP', type: 'sync' },
      { id: 'c4', source: 'api_gateway', target: 'search_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c5', source: 'api_gateway', target: 'product_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c6', source: 'api_gateway', target: 'inventory_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c7', source: 'api_gateway', target: 'payment_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c8', source: 'search_svc', target: 'redis', protocol: 'Redis', type: 'sync' },
      { id: 'c9', source: 'search_svc', target: 'opensearch', protocol: 'HTTP', type: 'sync' },
      { id: 'c10', source: 'inventory_svc', target: 'postgres', protocol: 'SQL', type: 'sync' },
      { id: 'c11', source: 'payment_svc', target: 'postgres', protocol: 'SQL', type: 'sync' },
      { id: 'c12', source: 'payment_svc', target: 'kafka', protocol: 'Kafka Event', type: 'async' },
      { id: 'c13', source: 'kafka', target: 'order_svc', protocol: 'Kafka Event', type: 'async' },
      { id: 'c14', source: 'order_svc', target: 'postgres', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Product Search (Redis Cache Hit)',
        description: 'Customer searches catalog; response served sub-10ms directly from Redis cache without database reads.',
        steps: [
          { stepNumber: 1, title: 'Client Search Request', sourceNodeId: 'client', targetNodeId: 'cdn_waf', action: 'GET /search?q=running', operation: 'HTTP GET', payload: 'q=running', result: 'Filtered Traffic', packetType: 'request', durationMs: 400, explanation: 'Client initiates search request through CDN/WAF.' },
          { stepNumber: 2, title: 'Load Balancer Route', sourceNodeId: 'cdn_waf', targetNodeId: 'load_balancer', action: 'Forward Request', operation: 'Round-Robin', payload: 'q=running', result: 'Balanced', packetType: 'request', durationMs: 400, explanation: 'Nginx load balancer selects API Gateway instance.' },
          { stepNumber: 3, title: 'API Gateway Dispatch', sourceNodeId: 'load_balancer', targetNodeId: 'api_gateway', action: 'Route to Search Service', operation: 'Gateway Proxy', payload: 'q=running', result: 'Routed', packetType: 'request', durationMs: 400, explanation: 'Gateway validates request and forwards to Search Service.' },
          { stepNumber: 4, title: 'Search Service Query', sourceNodeId: 'api_gateway', targetNodeId: 'search_svc', action: 'Execute Search', operation: 'Service Logic', payload: 'q=running', result: 'Checking Cache', packetType: 'request', durationMs: 400, explanation: 'Search Service receives query and constructs Redis cache key.' },
          { stepNumber: 5, title: 'Redis Cache GET', sourceNodeId: 'search_svc', targetNodeId: 'redis', action: 'GET search:q=running', operation: 'Redis GET', payload: 'search:q=running', result: 'CACHE HIT', packetType: 'query', durationMs: 400, explanation: 'Search Service checks Redis memory cache. Finds cached result!' },
          { stepNumber: 6, title: 'Redis Cache Return', sourceNodeId: 'redis', targetNodeId: 'search_svc', action: 'Return Cached JSON', operation: 'Cache Payload', payload: '{ items: [...], cached: true }', result: 'Sub-10ms Payload', packetType: 'cache_hit', durationMs: 400, explanation: 'Redis returns pre-cached JSON payload instantly.' },
          { stepNumber: 7, title: 'Return Response to Client', sourceNodeId: 'search_svc', targetNodeId: 'client', action: '200 OK (Cached Search Results)', operation: 'HTTP 200', payload: '{ items: [...], cached: true }', result: 'Success', packetType: 'response', durationMs: 600, explanation: 'Response returned to client without touching PostgreSQL database.' }
        ]
      },
      {
        id: 's2',
        title: 'Flash Sale Purchase Flow',
        description: 'Client completes flash sale purchase: Inventory Reservation -> Payment -> Kafka Event -> Order Creation.',
        steps: [
          { stepNumber: 1, title: 'Checkout Request', sourceNodeId: 'client', targetNodeId: 'api_gateway', action: 'POST /checkout', operation: 'HTTP POST', payload: 'productId=prod_flash_1, qty=1', result: 'Checkout Started', packetType: 'request', durationMs: 600, explanation: 'Client sends checkout request with Idempotency-Key.' },
          { stepNumber: 2, title: 'Reserve Inventory', sourceNodeId: 'api_gateway', targetNodeId: 'inventory_svc', action: 'Reserve Stock', operation: 'Atomic SQL', payload: 'qty=1', result: 'Atomic Lock', packetType: 'request', durationMs: 600, explanation: 'Gateway calls Inventory Service to lock stock.' },
          { stepNumber: 3, title: 'Atomic SQL Update', sourceNodeId: 'inventory_svc', targetNodeId: 'postgres', action: 'UPDATE inventory SET available = available - 1 WHERE available >= 1', operation: 'SQL Update', payload: 'available -= 1', result: '1 Row Affected', packetType: 'query', durationMs: 600, explanation: 'PostgreSQL executes atomic conditional update query.' },
          { stepNumber: 4, title: 'Process Payment', sourceNodeId: 'api_gateway', targetNodeId: 'payment_svc', action: 'Process Payment', operation: 'Payment Charge', payload: 'amount=$199.99', result: 'SUCCESS', packetType: 'request', durationMs: 600, explanation: 'Payment Service executes charge and records outbox event.' },
          { stepNumber: 5, title: 'Publish PaymentSucceeded', sourceNodeId: 'payment_svc', targetNodeId: 'kafka', action: 'Publish Event', operation: 'Kafka Event', payload: 'PaymentSucceeded', result: 'Durable Log', packetType: 'event', durationMs: 600, explanation: 'Payment Service publishes PaymentSucceeded event to Kafka topic.' },
          { stepNumber: 6, title: 'Consume Event & Create Order', sourceNodeId: 'kafka', targetNodeId: 'order_svc', action: 'Consume PaymentSucceeded', operation: 'Kafka Consumer', payload: 'paymentId=pay_9901', result: 'Order CONFIRMED', packetType: 'consumer', durationMs: 600, explanation: 'Order Service consumes event and creates order with UNIQUE(payment_id).' },
          { stepNumber: 7, title: 'Persist Order in DB', sourceNodeId: 'order_svc', targetNodeId: 'postgres', action: 'INSERT INTO orders', operation: 'SQL Insert', payload: 'orderId=ord_501', result: 'Order Saved', packetType: 'result', durationMs: 600, explanation: 'Order persisted in salestorm_order PostgreSQL database.' }
        ]
      }
    ]
  },

  'HLD-05': {
    id: 'HLD-05',
    code: 'HLD-05',
    title: 'Load Balancing & Scalability Architecture',
    subtitle: 'Horizontal Scaling, Traffic Distribution & Automatic Failover',
    description: 'Demonstrates Nginx Load Balancer distributing high traffic bursts across 3 inventory service instances, with automatic failover when Instance 1 experiences a simulated outage.',
    nodes: [
      { id: 'client_burst', label: 'Concurrent Users (10,000 Requests)', type: 'client', description: 'Simultaneous purchase requests during flash sale burst.', responsibility: 'Fires high volume requests.', receives: 'HTTP Responses', produces: 'Concurrent HTTP traffic', dataOwnership: 'User requests', dependencies: ['load_balancer'], communication: 'HTTP', whyItExists: 'Simulates flash sale surge.', x: 80, y: 250, width: 150, height: 80 },
      { id: 'load_balancer', label: 'Nginx Load Balancer', type: 'loadbalancer', description: 'Nginx Reverse Proxy Load Balancer.', responsibility: 'Round-robin traffic distribution & active health checking.', receives: 'High volume HTTP traffic', produces: 'Distributed HTTP requests', dataOwnership: 'Upstream server health', dependencies: ['inv_1', 'inv_2', 'inv_3'], communication: 'HTTP', whyItExists: 'Distributes load and prevents single-node bottlenecks.', x: 340, y: 250, width: 150, height: 80 },
      { id: 'inv_1', label: 'Inventory Instance 1 (:8081)', type: 'service', description: 'Inventory Service Node 1.', responsibility: 'Executes atomic stock updates.', receives: 'Routed HTTP requests', produces: 'Reservation locks', dataOwnership: 'Sessionless stateless worker', dependencies: ['postgres'], communication: 'REST / SQL', whyItExists: 'Horizontal scaling node 1.', x: 620, y: 120, width: 160, height: 70 },
      { id: 'inv_2', label: 'Inventory Instance 2 (:8082)', type: 'service', description: 'Inventory Service Node 2.', responsibility: 'Executes atomic stock updates.', receives: 'Routed HTTP requests', produces: 'Reservation locks', dataOwnership: 'Sessionless stateless worker', dependencies: ['postgres'], communication: 'REST / SQL', whyItExists: 'Horizontal scaling node 2.', x: 620, y: 250, width: 160, height: 70 },
      { id: 'inv_3', label: 'Inventory Instance 3 (:8083)', type: 'service', description: 'Inventory Service Node 3.', responsibility: 'Executes atomic stock updates.', receives: 'Routed HTTP requests', produces: 'Reservation locks', dataOwnership: 'Sessionless stateless worker', dependencies: ['postgres'], communication: 'REST / SQL', whyItExists: 'Horizontal scaling node 3.', x: 620, y: 380, width: 160, height: 70 },
      { id: 'postgres', label: 'PostgreSQL Database', type: 'database', description: 'Centralized Stock System of Record.', responsibility: 'Enforces atomic row update locks & CHECK(available >= 0).', receives: 'Concurrent SQL queries', produces: 'Updated stock rows', dataOwnership: 'Authoritative Inventory State', dependencies: [], communication: 'SQL', whyItExists: 'Single transactional source of truth across all instances.', x: 900, y: 250, width: 150, height: 80 }
    ],
    connections: [
      { id: 'c1', source: 'client_burst', target: 'load_balancer', protocol: 'HTTP', type: 'sync' },
      { id: 'c2', source: 'load_balancer', target: 'inv_1', protocol: 'HTTP', type: 'sync' },
      { id: 'c3', source: 'load_balancer', target: 'inv_2', protocol: 'HTTP', type: 'sync' },
      { id: 'c4', source: 'load_balancer', target: 'inv_3', protocol: 'HTTP', type: 'sync' },
      { id: 'c5', source: 'inv_1', target: 'postgres', protocol: 'SQL', type: 'sync' },
      { id: 'c6', source: 'inv_2', target: 'postgres', protocol: 'SQL', type: 'sync' },
      { id: 'c7', source: 'inv_3', target: 'postgres', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Round-Robin Traffic Distribution',
        description: 'Nginx distributes incoming requests 1 -> 2 -> 3 -> 1 across instances evenly.',
        steps: [
          { stepNumber: 1, title: 'Request 1 to Instance 1', sourceNodeId: 'load_balancer', targetNodeId: 'inv_1', action: 'Route Request 1', operation: 'Round-Robin #1', payload: 'req_1', result: 'Routed to :8081', packetType: 'request', durationMs: 600, explanation: 'Nginx routes first request to Inventory Instance 1.' },
          { stepNumber: 2, title: 'Request 2 to Instance 2', sourceNodeId: 'load_balancer', targetNodeId: 'inv_2', action: 'Route Request 2', operation: 'Round-Robin #2', payload: 'req_2', result: 'Routed to :8082', packetType: 'request', durationMs: 600, explanation: 'Nginx routes second request to Inventory Instance 2.' },
          { stepNumber: 3, title: 'Request 3 to Instance 3', sourceNodeId: 'load_balancer', targetNodeId: 'inv_3', action: 'Route Request 3', operation: 'Round-Robin #3', payload: 'req_3', result: 'Routed to :8083', packetType: 'request', durationMs: 600, explanation: 'Nginx routes third request to Inventory Instance 3.' },
          { stepNumber: 4, title: 'All Instances Query PostgreSQL', sourceNodeId: 'inv_2', targetNodeId: 'postgres', action: 'Atomic Stock Reservation', operation: 'SQL Update', payload: 'available -= 1', result: 'Stock Reserved', packetType: 'query', durationMs: 600, explanation: 'All stateless instances execute atomic update queries against central PostgreSQL DB.' }
        ]
      },
      {
        id: 's2',
        title: 'Instance Node Failure & Automatic Failover',
        description: 'Instance 1 experiences failure. Nginx detects health check failure and reroutes traffic automatically to Instance 2 & 3.',
        steps: [
          { stepNumber: 1, title: 'Instance 1 Outage Detected', sourceNodeId: 'inv_1', targetNodeId: 'load_balancer', action: 'Health Check Failed', operation: 'Nginx Passive Health', payload: '500 Server Error', result: 'Node Marked DOWN', packetType: 'failure', durationMs: 800, failedNodeId: 'inv_1', explanation: 'Nginx detects Instance 1 failure via connection health check.' },
          { stepNumber: 2, title: 'Failover Reroute to Instance 2', sourceNodeId: 'load_balancer', targetNodeId: 'inv_2', action: 'Reroute Traffic', operation: 'Automatic Failover', payload: 'req_burst', result: 'Routed to Healthy Node', packetType: 'failover', durationMs: 600, explanation: 'Nginx automatically reroutes traffic to healthy Instance 2 without user impact.' },
          { stepNumber: 3, title: 'Reroute Traffic to Instance 3', sourceNodeId: 'load_balancer', targetNodeId: 'inv_3', action: 'Reroute Traffic', operation: 'Automatic Failover', payload: 'req_burst', result: 'Routed to Healthy Node', packetType: 'failover', durationMs: 600, explanation: 'Traffic continues to load balance seamlessly across active nodes.' }
        ]
      }
    ]
  },

  'HLD-03': {
    id: 'HLD-03',
    code: 'HLD-03',
    title: 'Microservices Architecture',
    subtitle: 'Service Boundaries, Responsibilities & Autonomous Data Stores',
    description: 'Displays each microservice (Product, Search, Cart, Inventory, Payment, Order) with its isolated database/cache ownership and inter-service HTTP REST & Kafka event flows.',
    nodes: [
      { id: 'gateway', label: 'API Gateway', type: 'gateway', description: 'Entry point router.', responsibility: 'JWT auth, routing & rate limiting.', receives: 'HTTP requests', produces: 'Service routes', dataOwnership: 'Routes', dependencies: ['cart_svc', 'product_svc', 'search_svc', 'inventory_svc', 'payment_svc'], communication: 'HTTP', whyItExists: 'Centralized entry proxy.', x: 80, y: 250, width: 130, height: 75 },
      { id: 'cart_svc', label: 'Cart Service', type: 'service', description: 'Shopping cart state service.', responsibility: 'Manages user cart items.', receives: 'POST /cart', produces: 'Cart DTO', dataOwnership: 'salestorm_cart DB', dependencies: ['dbs'], communication: 'REST / SQL', whyItExists: 'Cart state management.', x: 320, y: 70, width: 140, height: 65 },
      { id: 'product_svc', label: 'Product Service', type: 'service', description: 'Catalog & metadata service.', responsibility: 'Product details & outbox events.', receives: 'GET /products', produces: 'Product DTO', dataOwnership: 'salestorm_product DB', dependencies: ['dbs'], communication: 'REST / SQL', whyItExists: 'Catalog metadata authoring.', x: 320, y: 155, width: 140, height: 65 },
      { id: 'search_svc', label: 'Search Service', type: 'service', description: 'Product search engine.', responsibility: 'Faceted search & cache reads.', receives: 'GET /search', produces: 'Search hits', dataOwnership: 'Redis Cache', dependencies: ['redis'], communication: 'REST / Redis', whyItExists: 'Sub-10ms query execution.', x: 320, y: 240, width: 140, height: 65 },
      { id: 'inventory_svc', label: 'Inventory Service', type: 'service', description: 'Atomic stock locking engine.', responsibility: 'Stock reservation & expiry TTL.', receives: 'POST /reservations', produces: 'Locks', dataOwnership: 'salestorm_inventory DB', dependencies: ['dbs'], communication: 'REST / SQL', whyItExists: 'Guarantees zero overselling.', x: 320, y: 325, width: 140, height: 65 },
      { id: 'payment_svc', label: 'Payment Service', type: 'service', description: 'Payment processor.', responsibility: 'Card charge & PaymentOutbox.', receives: 'POST /payments', produces: 'PaymentSucceeded event', dataOwnership: 'salestorm_payment DB', dependencies: ['dbs', 'kafka'], communication: 'REST / SQL / Kafka', whyItExists: 'Monetary authorization.', x: 320, y: 410, width: 140, height: 65 },
      { id: 'order_svc', label: 'Order Service', type: 'service', description: 'Order lifecycle engine.', responsibility: 'Order creation & state machine.', receives: 'Kafka event', produces: 'Confirmed orders', dataOwnership: 'salestorm_order DB', dependencies: ['dbs', 'kafka'], communication: 'REST / SQL / Kafka', whyItExists: 'Order lifecycle state machine.', x: 620, y: 325, width: 140, height: 65 },
      { id: 'redis', label: 'Redis Cache', type: 'cache', description: 'In-memory cache.', responsibility: 'Search caching.', receives: 'GET/SET key', produces: 'JSON cache', dataOwnership: 'RAM', dependencies: [], communication: 'Redis RESP', whyItExists: 'Offloads database reads.', x: 620, y: 240, width: 130, height: 65 },
      { id: 'dbs', label: 'PostgreSQL DBs', type: 'database', description: 'Logical DB cluster.', responsibility: 'System of Record persistence.', receives: 'SQL queries', produces: 'Persisted rows', dataOwnership: 'System of Record', dependencies: [], communication: 'SQL', whyItExists: 'ACID transactional store.', x: 860, y: 150, width: 140, height: 80 },
      { id: 'kafka', label: 'Kafka Event Bus', type: 'broker', description: 'Event streaming bus.', responsibility: 'Outbox event buffer.', receives: 'Domain events', produces: 'Event stream', dataOwnership: 'Topic partition logs', dependencies: [], communication: 'Kafka Protocol', whyItExists: 'Decoupled async communication.', x: 860, y: 350, width: 140, height: 80 }
    ],
    connections: [
      { id: 'c1', source: 'gateway', target: 'cart_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c2', source: 'gateway', target: 'product_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c3', source: 'gateway', target: 'search_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c4', source: 'gateway', target: 'inventory_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c5', source: 'gateway', target: 'payment_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c6', source: 'search_svc', target: 'redis', protocol: 'Redis', type: 'sync' },
      { id: 'c7', source: 'payment_svc', target: 'kafka', protocol: 'Kafka Event', type: 'async' },
      { id: 'c8', source: 'kafka', target: 'order_svc', protocol: 'Kafka Event', type: 'async' },
      { id: 'c9', source: 'inventory_svc', target: 'dbs', protocol: 'SQL', type: 'sync' },
      { id: 'c10', source: 'order_svc', target: 'dbs', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Complete Microservices Checkout Workflow',
        description: 'Demonstrates request passing across Gateway -> Inventory -> Payment -> Kafka -> Order Service.',
        steps: [
          { stepNumber: 1, title: 'Gateway Routes Checkout', sourceNodeId: 'gateway', targetNodeId: 'inventory_svc', action: 'POST /api/v1/reservations', operation: 'HTTP POST', payload: 'productId=p101, qty=1', result: 'Routing to Inventory', packetType: 'request', durationMs: 500, explanation: 'API Gateway routes checkout request to Inventory Service.' },
          { stepNumber: 2, title: 'Inventory Service Reserves Stock', sourceNodeId: 'inventory_svc', targetNodeId: 'dbs', action: 'Atomic Stock Lock', operation: 'SQL Update', payload: 'available -= 1', result: 'Reserved', packetType: 'query', durationMs: 600, explanation: 'Inventory Service executes atomic reservation query on PostgreSQL.' },
          { stepNumber: 3, title: 'Process Payment Charge', sourceNodeId: 'gateway', targetNodeId: 'payment_svc', action: 'POST /api/v1/payments', operation: 'HTTP POST', payload: 'amount=$199.99', result: 'Payment Success', packetType: 'request', durationMs: 600, explanation: 'Gateway triggers Payment Service to authorize charge.' },
          { stepNumber: 4, title: 'Publish Outbox Event to Kafka', sourceNodeId: 'payment_svc', targetNodeId: 'kafka', action: 'Publish PaymentSucceeded', operation: 'Kafka Event', payload: 'paymentId=pay_9901', result: 'Event Emitted', packetType: 'event', durationMs: 600, explanation: 'Payment Service publishes PaymentSucceeded outbox event to Kafka.' },
          { stepNumber: 5, title: 'Order Service Consumes Event', sourceNodeId: 'kafka', targetNodeId: 'order_svc', action: 'Consume PaymentSucceeded', operation: 'Kafka Consumer', payload: 'paymentId=pay_9901', result: 'Order CONFIRMED', packetType: 'consumer', durationMs: 600, explanation: 'Order Service consumes event asynchronously and creates order in DB.' }
        ]
      }
    ]
  },

  'HLD-04': {
    id: 'HLD-04',
    code: 'HLD-04',
    title: 'Deployment Architecture',
    subtitle: 'Multi-Instance Runtime Container Deployment & High Availability',
    description: 'Runtime deployment topology featuring multiple replicas of API Gateway and Microservice instances behind Nginx Load Balancers connected to PostgreSQL and Redis clusters.',
    nodes: [
      { id: 'client', label: 'User Traffic', type: 'client', description: 'External web clients.', responsibility: 'Sends HTTPS requests.', receives: 'HTTP Responses', produces: 'HTTPS requests', dataOwnership: 'Client traffic', dependencies: ['lb'], communication: 'HTTPS', whyItExists: 'Traffic source.', x: 80, y: 250, width: 120, height: 75 },
      { id: 'lb', label: 'Load Balancer Cluster', type: 'loadbalancer', description: 'Dual Nginx reverse proxies.', responsibility: 'SSL termination & load distribution.', receives: 'Client HTTPS', produces: 'Balanced HTTP', dataOwnership: 'Health state', dependencies: ['gw_1', 'gw_2'], communication: 'HTTP', whyItExists: 'Prevents single-point-of-failure.', x: 270, y: 250, width: 140, height: 75 },
      { id: 'gw_1', label: 'API Gateway Node 1', type: 'gateway', description: 'Gateway container replica 1.', responsibility: 'JWT auth & rate limiting.', receives: 'HTTP request', produces: 'Service route', dataOwnership: 'Node 1 state', dependencies: ['svc_group_1'], communication: 'HTTP', whyItExists: 'Gateway horizontal scale node 1.', x: 500, y: 140, width: 150, height: 70 },
      { id: 'gw_2', label: 'API Gateway Node 2', type: 'gateway', description: 'Gateway container replica 2.', responsibility: 'JWT auth & rate limiting.', receives: 'HTTP request', produces: 'Service route', dataOwnership: 'Node 2 state', dependencies: ['svc_group_2'], communication: 'HTTP', whyItExists: 'Gateway horizontal scale node 2.', x: 500, y: 360, width: 150, height: 70 },
      { id: 'svc_group_1', label: 'Service Pod Cluster A', type: 'service', description: 'Product & Search Container Pods.', responsibility: 'Handles query workload.', receives: 'Routed requests', produces: 'Query results', dataOwnership: 'Pod A RAM', dependencies: ['redis_cluster'], communication: 'REST', whyItExists: 'Stateless service node cluster A.', x: 740, y: 140, width: 160, height: 70 },
      { id: 'svc_group_2', label: 'Service Pod Cluster B', type: 'service', description: 'Inventory & Payment Container Pods.', responsibility: 'Handles write & payment workload.', receives: 'Routed requests', produces: 'State changes', dataOwnership: 'Pod B RAM', dependencies: ['postgres_cluster'], communication: 'REST / SQL', whyItExists: 'Stateless service node cluster B.', x: 740, y: 360, width: 160, height: 70 },
      { id: 'redis_cluster', label: 'Redis HA Cluster', type: 'cache', description: 'Redis Sentinel HA cluster.', responsibility: 'In-memory caching.', receives: 'GET/SET keys', produces: 'Cached JSON', dataOwnership: 'RAM Cache', dependencies: [], communication: 'Redis RESP', whyItExists: 'High availability caching.', x: 960, y: 140, width: 130, height: 70 },
      { id: 'postgres_cluster', label: 'PostgreSQL Primary/Replica', type: 'database', description: 'Primary DB + Read Replicas.', responsibility: 'ACID transaction persistence.', receives: 'SQL queries', produces: 'Database rows', dataOwnership: 'Primary System of Record', dependencies: [], communication: 'SQL', whyItExists: 'Authoritative durable persistence.', x: 960, y: 360, width: 140, height: 75 }
    ],
    connections: [
      { id: 'c1', source: 'client', target: 'lb', protocol: 'HTTPS', type: 'sync' },
      { id: 'c2', source: 'lb', target: 'gw_1', protocol: 'HTTP', type: 'sync' },
      { id: 'c3', source: 'lb', target: 'gw_2', protocol: 'HTTP', type: 'sync' },
      { id: 'c4', source: 'gw_1', target: 'svc_group_1', protocol: 'HTTP', type: 'sync' },
      { id: 'c5', source: 'gw_2', target: 'svc_group_2', protocol: 'HTTP', type: 'sync' },
      { id: 'c6', source: 'svc_group_1', target: 'redis_cluster', protocol: 'Redis', type: 'sync' },
      { id: 'c7', source: 'svc_group_2', target: 'postgres_cluster', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Multi-Instance Deployment Load Distribution & Failover',
        description: 'Demonstrates load balancer routing traffic across Gateway replicas and shifting traffic upon node outage.',
        steps: [
          { stepNumber: 1, title: 'Traffic to Gateway Node 1', sourceNodeId: 'lb', targetNodeId: 'gw_1', action: 'Route Request to Node 1', operation: 'Round-Robin', payload: 'req_1', result: 'Node 1 Active', packetType: 'request', durationMs: 500, explanation: 'Load balancer routes incoming client request to Gateway Node 1.' },
          { stepNumber: 2, title: 'Node 1 Forwards to Pod Cluster A', sourceNodeId: 'gw_1', targetNodeId: 'svc_group_1', action: 'Forward Query', operation: 'HTTP REST', payload: 'GET /search', result: 'Processing', packetType: 'request', durationMs: 500, explanation: 'Gateway Node 1 proxies search query to Service Pod Cluster A.' },
          { stepNumber: 3, title: 'Node 1 Outage (Failover to Node 2)', sourceNodeId: 'gw_1', targetNodeId: 'lb', action: 'Node 1 Outage Detected', operation: 'Health Check Fail', payload: '503 Unavailable', result: 'Marked DOWN', packetType: 'failure', durationMs: 800, failedNodeId: 'gw_1', explanation: 'Gateway Node 1 fails; load balancer instantly detects outage.' },
          { stepNumber: 4, title: 'Seamless Failover to Gateway Node 2', sourceNodeId: 'lb', targetNodeId: 'gw_2', action: 'Reroute to Gateway Node 2', operation: 'Automatic Failover', payload: 'req_2', result: 'Node 2 Active', packetType: 'failover', durationMs: 600, explanation: 'Load balancer reroutes traffic seamlessly to healthy Gateway Node 2.' }
        ]
      }
    ]
  },

  'HLD-06': {
    id: 'HLD-06',
    code: 'HLD-06',
    title: 'Data Architecture',
    subtitle: 'System of Record Entities, Isolated Logical Schemas & Transactional Boundaries',
    description: 'Illustrates PostgreSQL as the System of Record across all 15 core entities (CUSTOMER, PRODUCT, INVENTORY, INVENTORY_RESERVATION, PAYMENT, ORDER, etc.) proving Redis is NOT authoritative for inventory.',
    nodes: [
      { id: 'client', label: 'Client App', type: 'client', description: 'Purchase initiator.', responsibility: 'Sends reservation intent.', receives: 'Status DTO', produces: 'POST /reservations', dataOwnership: 'Client session', dependencies: ['inv_svc'], communication: 'HTTP', whyItExists: 'User touchpoint.', x: 80, y: 250, width: 130, height: 75 },
      { id: 'inv_svc', label: 'Inventory Service', type: 'service', description: 'Stock reservation manager.', responsibility: 'Queries PostgreSQL System of Record & updates Redis cache.', receives: 'Reservation requests', produces: 'Reservation locks', dataOwnership: 'Logic manager', dependencies: ['db_inv', 'redis_cache'], communication: 'REST / SQL / Redis', whyItExists: 'Enforces ACID stock rules.', x: 360, y: 250, width: 150, height: 80 },
      { id: 'db_inv', label: 'PostgreSQL Inventory DB', type: 'database', description: 'Authoritative System of Record.', responsibility: 'Enforces CHECK(available_quantity >= 0) constraint.', receives: 'ACID UPDATE SQL', produces: '1 row affected or 0', dataOwnership: 'INVENTORY & RESERVATION tables', dependencies: [], communication: 'SQL', whyItExists: 'Authoritative source of truth.', x: 720, y: 160, width: 180, height: 85 },
      { id: 'db_order', label: 'PostgreSQL Order DB', type: 'database', description: 'Authoritative Order System of Record.', responsibility: 'Enforces UNIQUE(payment_id) constraint.', receives: 'INSERT INTO orders SQL', produces: 'Confirmed Order ID', dataOwnership: 'ORDER & ORDER_ITEM tables', dependencies: [], communication: 'SQL', whyItExists: 'Deduplicated order ledger.', x: 720, y: 340, width: 180, height: 85 },
      { id: 'redis_cache', label: 'Redis Read Cache', type: 'cache', description: 'Non-Authoritative RAM Cache.', responsibility: 'Transient stock count display.', receives: 'SET stock count', produces: 'Cached stock count', dataOwnership: 'Transient cache only', dependencies: [], communication: 'Redis RESP', whyItExists: 'Fast display reads ONLY. NEVER authoritative.', x: 360, y: 420, width: 160, height: 70 }
    ],
    connections: [
      { id: 'c1', source: 'client', target: 'inv_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c2', source: 'inv_svc', target: 'db_inv', protocol: 'SQL', type: 'sync' },
      { id: 'c3', source: 'inv_svc', target: 'db_order', protocol: 'SQL', type: 'sync' },
      { id: 'c4', source: 'inv_svc', target: 'redis_cache', protocol: 'Redis', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Authoritative PostgreSQL Stock Reservation Flow',
        description: 'Demonstrates that PostgreSQL System of Record executes the authoritative reservation query, while Redis is updated only as a non-authoritative cache.',
        steps: [
          { stepNumber: 1, title: 'Reserve Stock Request', sourceNodeId: 'client', targetNodeId: 'inv_svc', action: 'POST /reservations', operation: 'HTTP POST', payload: 'productId=prod_101, qty=1', result: 'Received', packetType: 'request', durationMs: 500, explanation: 'Client requests 1 stock unit reservation.' },
          { stepNumber: 2, title: 'Query PostgreSQL System of Record', sourceNodeId: 'inv_svc', targetNodeId: 'db_inv', action: 'UPDATE inventory SET available = available - 1 WHERE available >= 1', operation: 'Authoritative SQL', payload: 'available -= 1', result: '1 Row Affected (Granted)', packetType: 'query', durationMs: 600, explanation: 'Inventory Service executes ACID update on PostgreSQL System of Record. Stock locked!' },
          { stepNumber: 3, title: 'Update Non-Authoritative Redis Cache', sourceNodeId: 'inv_svc', targetNodeId: 'redis_cache', action: 'SET stock:prod_101 99', operation: 'Redis SET', payload: 'stock = 99', result: 'Cache Updated', packetType: 'query', durationMs: 400, explanation: 'Service updates Redis display count. Note: PostgreSQL remains sole authoritative source of truth!' },
          { stepNumber: 4, title: 'Return Success to Client', sourceNodeId: 'inv_svc', targetNodeId: 'client', action: '201 Created (Reservation Granted)', operation: 'HTTP 201', payload: 'reservationId=res_9910', result: 'Success', packetType: 'response', durationMs: 400, explanation: 'Client receives reservation confirmation.' }
        ]
      }
    ]
  },

  'HLD-07': {
    id: 'HLD-07',
    code: 'HLD-07',
    title: 'Redis Caching Architecture',
    subtitle: 'Cache-Aside Pattern, Parameter-Aware Keys & Graceful Degradation',
    description: 'Demonstrates Redis Cache-Aside pattern for search and product queries. Shows Cache Hit (sub-10ms), Cache Miss (PostgreSQL read + Redis SET), and Graceful Fallback during Redis outage.',
    nodes: [
      { id: 'client', label: 'Client App', type: 'client', description: 'User client.', responsibility: 'Sends product search query.', receives: 'JSON search payload', produces: 'GET /search', dataOwnership: 'Client state', dependencies: ['search_svc'], communication: 'HTTP', whyItExists: 'Query initiator.', x: 100, y: 250, width: 130, height: 70 },
      { id: 'search_svc', label: 'Search Service', type: 'service', description: 'Product Query & Cache Manager.', responsibility: 'Constructs parameter-aware cache key `search:q=...:cat=...:sort=...` and queries Redis.', receives: 'GET search', produces: 'Cache queries & DB fallbacks', dataOwnership: 'Cache key builder', dependencies: ['redis', 'postgres'], communication: 'REST / Redis / SQL', whyItExists: 'Orchestrates cache-aside logic.', x: 400, y: 250, width: 150, height: 80 },
      { id: 'redis', label: 'Redis Cache Server', type: 'cache', description: 'In-Memory Key-Value Cache (300s TTL).', responsibility: 'Stores serialized search results & product JSONs.', receives: 'GET/SET key', produces: 'Cached JSON payload', dataOwnership: 'Transient RAM cache', dependencies: [], communication: 'Redis RESP', whyItExists: 'Sub-10ms response latency.', x: 720, y: 140, width: 150, height: 80 },
      { id: 'postgres', label: 'PostgreSQL Database', type: 'database', description: 'Authoritative Relational Database.', responsibility: 'System of record queried on cache miss or Redis outage.', receives: 'SQL SELECT queries', produces: 'Database table rows', dataOwnership: 'Authoritative Product Data', dependencies: [], communication: 'SQL', whyItExists: 'System of Record.', x: 720, y: 360, width: 150, height: 80 }
    ],
    connections: [
      { id: 'c1', source: 'client', target: 'search_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c2', source: 'search_svc', target: 'redis', protocol: 'Redis', type: 'sync' },
      { id: 'c3', source: 'search_svc', target: 'postgres', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Cache Hit Scenario (Sub-10ms Response)',
        description: 'Query key exists in Redis. Data returned instantly without touching PostgreSQL database.',
        steps: [
          { stepNumber: 1, title: 'Client Search Request', sourceNodeId: 'client', targetNodeId: 'search_svc', action: 'GET /api/v1/search?q=running', operation: 'HTTP GET', payload: 'q=running', result: 'Search Received', packetType: 'request', durationMs: 400, explanation: 'Client sends product search request.' },
          { stepNumber: 2, title: 'Construct Cache Key & GET Redis', sourceNodeId: 'search_svc', targetNodeId: 'redis', action: 'GET search:q=running:cat=:sort=relevance:p=1', operation: 'Redis GET', payload: 'Key: search:q=running...', result: 'CACHE HIT', packetType: 'query', durationMs: 400, explanation: 'Search Service queries Redis with deterministic parameter-aware key.' },
          { stepNumber: 3, title: 'Redis Cache Hit Return', sourceNodeId: 'redis', targetNodeId: 'search_svc', action: 'Return Serialized JSON', operation: 'Cache Payload', payload: '{ items: [...], totalHits: 42, cached: true }', result: 'Sub-10ms Data', packetType: 'cache_hit', durationMs: 400, explanation: 'Redis returns pre-cached search response in sub-10ms time.' },
          { stepNumber: 4, title: 'Return to Client', sourceNodeId: 'search_svc', targetNodeId: 'client', action: '200 OK (Cached Search Response)', operation: 'HTTP 200', payload: '{ items: [...], cached: true }', result: 'Success', packetType: 'response', durationMs: 400, explanation: 'Search Service returns response to client without querying PostgreSQL.' }
        ]
      },
      {
        id: 's2',
        title: 'Cache Miss Scenario (DB Read + Redis SET)',
        description: 'Query key not in Redis. Search Service queries PostgreSQL, caches result in Redis (300s TTL), and returns data.',
        steps: [
          { stepNumber: 1, title: 'Client Search Request', sourceNodeId: 'client', targetNodeId: 'search_svc', action: 'GET /api/v1/search?q=new_item', operation: 'HTTP GET', payload: 'q=new_item', result: 'Search Received', packetType: 'request', durationMs: 400, explanation: 'Client searches for newly added product.' },
          { stepNumber: 2, title: 'GET Redis (MISS)', sourceNodeId: 'search_svc', targetNodeId: 'redis', action: 'GET search:q=new_item...', operation: 'Redis GET', payload: 'Key: search:q=new_item...', result: 'CACHE MISS (null)', packetType: 'cache_miss', durationMs: 400, explanation: 'Redis checks memory key. Returns null (Cache Miss).' },
          { stepNumber: 3, title: 'Query PostgreSQL Database', sourceNodeId: 'search_svc', targetNodeId: 'postgres', action: 'SELECT * FROM products WHERE name LIKE %new_item%', operation: 'SQL Query', payload: 'SELECT query', result: 'Rows Returned', packetType: 'query', durationMs: 600, explanation: 'Search Service falls back to querying PostgreSQL product database.' },
          { stepNumber: 4, title: 'Populate Redis Cache (300s TTL)', sourceNodeId: 'search_svc', targetNodeId: 'redis', action: 'SETEX search:q=new_item... 300 JSON', operation: 'Redis SETEX', payload: 'TTL: 300 Seconds', result: 'Cached in Redis', packetType: 'query', durationMs: 400, explanation: 'Search Service populates Redis cache with 300-second TTL for future hits.' },
          { stepNumber: 5, title: 'Return Data to Client', sourceNodeId: 'search_svc', targetNodeId: 'client', action: '200 OK (Fresh DB Results)', operation: 'HTTP 200', payload: '{ items: [...], cached: false }', result: 'Success', packetType: 'response', durationMs: 400, explanation: 'Response returned to client.' }
        ]
      }
    ]
  },

  'HLD-08': {
    id: 'HLD-08',
    code: 'HLD-08',
    title: 'Synchronous & Asynchronous Communication',
    subtitle: 'REST HTTP vs Event-Driven Messaging Architecture',
    description: 'Clearly decouples Synchronous low-latency REST HTTP request/response calls (Client -> Gateway -> Search/Cart) from Asynchronous event-driven outbox messaging (Payment -> Kafka -> Order & Notification consumers).',
    nodes: [
      { id: 'client', label: 'Client App', type: 'client', description: 'User client.', responsibility: 'Triggers REST calls & payments.', receives: 'HTTP Responses', produces: 'HTTPS requests', dataOwnership: 'Client state', dependencies: ['gateway'], communication: 'HTTPS', whyItExists: 'User initiator.', x: 60, y: 250, width: 120, height: 75 },
      { id: 'gateway', label: 'API Gateway', type: 'gateway', description: 'Synchronous HTTP Proxy.', responsibility: 'Proxies REST calls synchronously.', receives: 'HTTP requests', produces: 'Service calls', dataOwnership: 'Routes', dependencies: ['sync_svc'], communication: 'HTTP REST', whyItExists: 'Sync request routing.', x: 250, y: 250, width: 130, height: 75 },
      { id: 'sync_svc', label: 'Payment Service (Sync REST)', type: 'service', description: 'Synchronous Payment Service.', responsibility: 'Processes REST payment charge & writes to outbox table.', receives: 'POST /payments', produces: 'PaymentSucceeded Event', dataOwnership: 'salestorm_payment DB', dependencies: ['async_broker'], communication: 'REST / Outbox', whyItExists: 'Low-latency payment authorization.', x: 480, y: 150, width: 170, height: 75 },
      { id: 'async_broker', label: 'Kafka Message Broker (Async)', type: 'broker', description: 'Asynchronous Event Bus Log.', responsibility: 'Buffers PaymentSucceeded domain event for downstream consumers.', receives: 'PaymentSucceeded Event', produces: 'Event stream delivery', dataOwnership: 'Topic partition logs', dependencies: ['order_consumer', 'notif_consumer'], communication: 'Kafka Protocol', whyItExists: 'Decoupled event broadcasting.', x: 480, y: 350, width: 170, height: 75 },
      { id: 'order_consumer', label: 'Order Service Consumer', type: 'service', description: 'Async Order Consumer.', responsibility: 'Consumes PaymentSucceeded event and creates confirmed order.', receives: 'PaymentSucceeded event', produces: 'Order row', dataOwnership: 'salestorm_order DB', dependencies: [], communication: 'Kafka Consumer', whyItExists: 'Async order state updates.', x: 780, y: 270, width: 170, height: 70 },
      { id: 'notif_consumer', label: 'Notification Consumer', type: 'service', description: 'Async Email/SMS Consumer.', responsibility: 'Consumes event and sends email notification.', receives: 'PaymentSucceeded event', produces: 'Email dispatch', dataOwnership: 'Email log', dependencies: [], communication: 'Kafka Consumer', whyItExists: 'Non-blocking notification delivery.', x: 780, y: 410, width: 170, height: 70 }
    ],
    connections: [
      { id: 'c1', source: 'client', target: 'gateway', protocol: 'HTTPS', type: 'sync' },
      { id: 'c2', source: 'gateway', target: 'sync_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c3', source: 'sync_svc', target: 'async_broker', protocol: 'Kafka Event', type: 'async' },
      { id: 'c4', source: 'async_broker', target: 'order_consumer', protocol: 'Kafka Event', type: 'async' },
      { id: 'c5', source: 'async_broker', target: 'notif_consumer', protocol: 'Kafka Event', type: 'async' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Sync Payment REST Charge + Async Event Consumer Fanout',
        description: 'Synchronous REST payment charge completes immediately, followed by asynchronous Kafka event fanout to Order and Notification consumers.',
        steps: [
          { stepNumber: 1, title: 'Sync REST Payment Call', sourceNodeId: 'client', targetNodeId: 'gateway', action: 'POST /api/v1/payments (Sync)', operation: 'HTTP REST', payload: 'amount=$199.99', result: 'Routed to Payment', packetType: 'request', durationMs: 400, explanation: 'Client initiates synchronous REST payment charge.' },
          { stepNumber: 2, title: 'Payment Authorized & Returned', sourceNodeId: 'sync_svc', targetNodeId: 'client', action: '200 OK (Payment Approved)', operation: 'HTTP 200', payload: 'status=APPROVED, txRef=tx_9901', result: 'Sync REST Complete', packetType: 'response', durationMs: 500, explanation: 'Payment Service authorizes card synchronously and returns 200 OK to client.' },
          { stepNumber: 3, title: 'Publish Async Outbox Event to Kafka', sourceNodeId: 'sync_svc', targetNodeId: 'async_broker', action: 'Publish PaymentSucceeded Event', operation: 'Async Kafka Event', payload: 'paymentId=pay_9901', result: 'Event Buffered', packetType: 'event', durationMs: 500, explanation: 'Payment Service asynchronously publishes PaymentSucceeded event to Kafka broker.' },
          { stepNumber: 4, title: 'Async Consumer 1 (Order Service)', sourceNodeId: 'async_broker', targetNodeId: 'order_consumer', action: 'Consume PaymentSucceeded', operation: 'Kafka Consumer', payload: 'paymentId=pay_9901', result: 'Order CONFIRMED', packetType: 'consumer', durationMs: 600, explanation: 'Order Service consumer receives event asynchronously and confirms order.' },
          { stepNumber: 5, title: 'Async Consumer 2 (Notification Service)', sourceNodeId: 'async_broker', targetNodeId: 'notif_consumer', action: 'Consume PaymentSucceeded', operation: 'Kafka Consumer', payload: 'to=customer@email.com', result: 'Email Sent', packetType: 'consumer', durationMs: 500, explanation: 'Notification consumer receives event asynchronously and dispatches confirmation email without blocking user REST response.' }
        ]
      }
    ]
  },

  'HLD-09': {
    id: 'HLD-09',
    code: 'HLD-09',
    title: 'Inventory Concurrency & Zero Overselling',
    subtitle: 'Atomic SQL Conditional Update & Expiry Worker Lifecycle',
    description: 'Demonstrates 10,000 concurrent purchase attempts hitting 100 available stock units. Proves atomic SQL conditional updates ensure ZERO OVERSELLING.',
    nodes: [
      { id: 'users_10k', label: '10,000 Concurrent Users', type: 'client', description: 'Simultaneous flash sale buyers.', responsibility: 'Sends reservation requests.', receives: '201 Created or 409 Conflict', produces: 'High-speed POST /reservations', dataOwnership: 'Buyer intent', dependencies: ['inv_svc'], communication: 'HTTP', whyItExists: 'Simulates flash sale concurrency burst.', x: 100, y: 250, width: 160, height: 80 },
      { id: 'inv_svc', label: 'Inventory Service', type: 'service', description: 'Concurrency-Safe Stock Engine.', responsibility: 'Executes atomic reservation queries & 10m TTL expiry worker.', receives: 'POST /reservations', produces: 'Reservation locks & expiry releases', dataOwnership: 'Inventory Manager', dependencies: ['postgres'], communication: 'REST / SQL', whyItExists: 'Enforces concurrency rules.', x: 420, y: 250, width: 160, height: 80 },
      { id: 'postgres', label: 'PostgreSQL Database', type: 'database', description: 'System of Record for Inventory.', responsibility: 'Enforces CHECK(available_quantity >= 0) & atomic update locks.', receives: 'Atomic UPDATE queries', produces: 'Affected row count (1 or 0)', dataOwnership: 'Authoritative Inventory State', dependencies: [], communication: 'SQL', whyItExists: 'Single transactional source of truth.', x: 760, y: 250, width: 160, height: 80 }
    ],
    connections: [
      { id: 'c1', source: 'users_10k', target: 'inv_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c2', source: 'inv_svc', target: 'postgres', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Flash Sale (10,000 Requests vs 100 Stock Units)',
        description: 'Simultaneous 10,000 reservation attempts against 100 stock. Grants exactly 100 reservations with ZERO overselling.',
        steps: [
          { stepNumber: 1, title: '10,000 Concurrent Reservation Requests', sourceNodeId: 'users_10k', targetNodeId: 'inv_svc', action: 'POST /api/v1/reservations (Qty: 1)', operation: 'HTTP POST', payload: 'Idempotency-Key: key_1..10000', result: 'Bursted Requests', packetType: 'request', durationMs: 500, explanation: '10,000 concurrent threads fire reservation requests simultaneously.' },
          { stepNumber: 2, title: 'Atomic SQL Conditional Update (1st 100)', sourceNodeId: 'inv_svc', targetNodeId: 'postgres', action: 'UPDATE inventory SET available = available - 1, reserved = reserved + 1 WHERE available >= 1', operation: 'SQL Atomic Update', payload: 'available -= 1', result: '1 Row Affected (Granted)', packetType: 'query', durationMs: 600, explanation: 'PostgreSQL executes atomic update for first 100 requests. 100 reservations granted!' },
          { stepNumber: 3, title: 'Return 201 Created (100 Successful)', sourceNodeId: 'inv_svc', targetNodeId: 'users_10k', action: '201 Created (Reservation Granted)', operation: 'HTTP 201', payload: 'status=RESERVED', result: '100 Granted', packetType: 'response', durationMs: 400, explanation: 'First 100 users receive successful reservation confirmation.' },
          { stepNumber: 4, title: 'Atomic SQL Conditional Update (Remaining 9,900)', sourceNodeId: 'inv_svc', targetNodeId: 'postgres', action: 'UPDATE inventory ... WHERE available >= 1', operation: 'SQL Atomic Update', payload: 'available = 0', result: '0 Rows Affected (Rejected)', packetType: 'query', durationMs: 600, explanation: 'Remaining 9,900 requests hit available = 0 condition. 0 rows affected!' },
          { stepNumber: 5, title: 'Return 409 Out of Stock (9,900 Rejected)', sourceNodeId: 'inv_svc', targetNodeId: 'users_10k', action: '409 OUT_OF_STOCK', operation: 'HTTP 409', payload: 'error=OUT_OF_STOCK', result: '0 Oversold (Invariant Passed)', packetType: 'response', durationMs: 400, explanation: '9,900 requests safely receive 409 OUT_OF_STOCK. Available quantity remains 0. Oversold = 0!' }
        ]
      }
    ]
  },

  'HLD-10': {
    id: 'HLD-10',
    code: 'HLD-10',
    title: 'Payment & Order Failure Recovery Architecture',
    subtitle: 'Payment Outbox Durability, Order Outage Recovery & Reconciliation',
    description: 'Demonstrates payment success while Order Service is DOWN. The PaymentSucceeded event remains durable in Kafka/Outbox; upon Order Service recovery, the event is consumed and order created with UNIQUE(payment_id) deduplication.',
    nodes: [
      { id: 'client', label: 'Client', type: 'client', description: 'Buyer client.', responsibility: 'Sends payment checkout.', receives: 'Checkout response', produces: 'POST /checkout', dataOwnership: 'Client session', dependencies: ['pay_svc'], communication: 'HTTP', whyItExists: 'Checkout trigger.', x: 80, y: 250, width: 120, height: 70 },
      { id: 'pay_svc', label: 'Payment Service', type: 'service', description: 'Payment Processor & Outbox Writer.', responsibility: 'Charges card & writes PaymentSucceeded event to payment_outbox in SAME ACID transaction.', receives: 'POST /payments', produces: 'PaymentSucceeded events', dataOwnership: 'salestorm_payment DB', dependencies: ['pay_db', 'kafka'], communication: 'REST / SQL / Kafka', whyItExists: 'Guarantees event durability.', x: 300, y: 250, width: 140, height: 75 },
      { id: 'pay_db', label: 'Payment DB & Outbox', type: 'database', description: 'PostgreSQL Payment DB.', responsibility: 'Stores payments table & payment_outbox table in single ACID transaction.', receives: 'BEGIN ... INSERT INTO outbox ... COMMIT', produces: 'Persisted outbox event', dataOwnership: 'Payment & Outbox Ledger', dependencies: [], communication: 'SQL', whyItExists: 'Eliminates dual-write event loss.', x: 300, y: 410, width: 140, height: 75 },
      { id: 'kafka', label: 'Kafka Event Bus', type: 'broker', description: 'Durable Message Queue Log.', responsibility: 'Retains PaymentSucceeded event safely while Order Service is down.', receives: 'PaymentSucceeded event', produces: 'Event stream delivery', dataOwnership: 'Partition log', dependencies: [], communication: 'Kafka Protocol', whyItExists: 'Temporal decoupling during service outages.', x: 550, y: 250, width: 130, height: 75 },
      { id: 'order_svc', label: 'Order Service (DOWN -> RECOVERED)', type: 'service', description: 'Order State Machine.', responsibility: 'Consumes PaymentSucceeded event upon recovery and creates order with UNIQUE(payment_id).', receives: 'PaymentSucceeded event', produces: 'Confirmed Order', dataOwnership: 'salestorm_order DB', dependencies: ['order_db'], communication: 'REST / SQL / Kafka', whyItExists: 'Processes order lifecycle.', x: 800, y: 250, width: 170, height: 75 },
      { id: 'order_db', label: 'Order DB', type: 'database', description: 'PostgreSQL Order DB.', responsibility: 'Enforces UNIQUE(payment_id) constraint preventing duplicate order creation.', receives: 'INSERT INTO orders', produces: 'Confirmed order row', dataOwnership: 'Authoritative Orders', dependencies: [], communication: 'SQL', whyItExists: 'Deduplicated order persistence.', x: 800, y: 410, width: 140, height: 75 }
    ],
    connections: [
      { id: 'c1', source: 'client', target: 'pay_svc', protocol: 'HTTP', type: 'sync' },
      { id: 'c2', source: 'pay_svc', target: 'pay_db', protocol: 'SQL', type: 'sync' },
      { id: 'c3', source: 'pay_svc', target: 'kafka', protocol: 'Kafka Event', type: 'async' },
      { id: 'c4', source: 'kafka', target: 'order_svc', protocol: 'Kafka Event', type: 'async' },
      { id: 'c5', source: 'order_svc', target: 'order_db', protocol: 'SQL', type: 'sync' }
    ],
    scenarios: [
      {
        id: 's1',
        title: 'Payment Success + Order Service Outage Recovery',
        description: 'Payment succeeds while Order Service is DOWN. Event remains safe in Kafka; Order Service recovers and creates order without duplicates.',
        steps: [
          { stepNumber: 1, title: 'Payment Success & Outbox Save', sourceNodeId: 'pay_svc', targetNodeId: 'pay_db', action: 'BEGIN → INSERT payment (SUCCESS) → INSERT outbox → COMMIT', operation: 'ACID Transaction', payload: 'PaymentSucceeded Event', result: 'Saved to Outbox', packetType: 'query', durationMs: 600, explanation: 'Payment Service saves payment success and outbox event in same ACID database transaction.' },
          { stepNumber: 2, title: 'Publish PaymentSucceeded to Kafka', sourceNodeId: 'pay_svc', targetNodeId: 'kafka', action: 'Publish Event to Kafka Topic payment-events', operation: 'Kafka Outbox Publisher', payload: 'paymentId=pay_9901', result: 'Retained in Topic', packetType: 'event', durationMs: 600, explanation: 'Outbox publisher emits event to Kafka topic.' },
          { stepNumber: 3, title: 'Order Service Outage (Simulated DOWN)', sourceNodeId: 'kafka', targetNodeId: 'order_svc', action: 'Order Service Unavailable', operation: 'Downtime Event Retention', payload: 'Event Retained', result: 'Zero Event Loss', packetType: 'failure', durationMs: 800, failedNodeId: 'order_svc', explanation: 'Order Service is DOWN. PaymentSucceeded event remains safely buffered in Kafka partition log.' },
          { stepNumber: 4, title: 'Order Service Recovers & Consumes Event', sourceNodeId: 'kafka', targetNodeId: 'order_svc', action: 'Order Service Restarts & Consumes Event', operation: 'Kafka Consumer Poll', payload: 'paymentId=pay_9901', result: 'Event Consumed', packetType: 'consumer', durationMs: 600, explanation: 'Order Service recovers, polls Kafka, and receives the durable PaymentSucceeded event.' },
          { stepNumber: 5, title: 'Idempotent Order Creation in DB', sourceNodeId: 'order_svc', targetNodeId: 'order_db', action: 'INSERT INTO orders (UNIQUE payment_id constraint)', operation: 'SQL Insert', payload: 'orderId=ord_501, paymentId=pay_9901', result: 'Order CONFIRMED', packetType: 'result', durationMs: 600, explanation: 'Order Service persists order in PostgreSQL with UNIQUE(payment_id) deduplication.' }
        ]
      }
    ]
  }
};
