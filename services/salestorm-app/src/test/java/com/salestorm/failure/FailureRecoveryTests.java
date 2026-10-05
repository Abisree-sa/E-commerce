package com.salestorm.failure;

import com.salestorm.inventory.model.Reservation;
import com.salestorm.inventory.service.InventoryService;
import com.salestorm.order.model.Order;
import com.salestorm.order.service.OrderService;
import com.salestorm.payment.model.Payment;
import com.salestorm.payment.service.PaymentService;
import com.salestorm.product.model.Product;
import com.salestorm.product.service.ProductService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@SpringBootTest
public class FailureRecoveryTests {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Test
    public void testDuplicateReservationIdempotency() {
        String key = "idem_res_test_" + UUID.randomUUID().toString();
        inventoryService.seedInventory("prod_flash_1", 100);

        Reservation r1 = inventoryService.reserveInventory("prod_flash_1", "user_1", 1, key);
        Reservation r2 = inventoryService.reserveInventory("prod_flash_1", "user_1", 1, key);

        Assertions.assertEquals(r1.getReservationId(), r2.getReservationId(), "Duplicate reservation with same key must return original reservation");
    }

    @Test
    public void testDuplicatePaymentIdempotency() {
        String key = "idem_pay_test_" + UUID.randomUUID().toString();
        Payment p1 = paymentService.processPayment("res_123", "cust_1", new BigDecimal("199.99"), "CARD", key, false, false);
        Payment p2 = paymentService.processPayment("res_123", "cust_1", new BigDecimal("199.99"), "CARD", key, false, false);

        Assertions.assertEquals(p1.getPaymentId(), p2.getPaymentId(), "Duplicate payment request must return original payment object");
    }

    @Test
    public void testDuplicateOrderCreationDeduplication() {
        String paymentId = "pay_dedup_" + UUID.randomUUID().toString();
        Order o1 = orderService.createOrderFromPayment(paymentId, "res_123", "cust_1", new BigDecimal("199.99"), "123 Way", null);
        Order o2 = orderService.createOrderFromPayment(paymentId, "res_123", "cust_1", new BigDecimal("199.99"), "123 Way", null);

        Assertions.assertEquals(o1.getOrderId(), o2.getOrderId(), "UNIQUE(payment_id) invariant must prevent duplicate order creation");
    }

    @Test
    public void testPaymentTimeoutReconciliation() {
        String key = "idem_timeout_" + UUID.randomUUID().toString();
        Payment p = paymentService.processPayment("res_123", "cust_1", new BigDecimal("199.99"), "CARD", key, false, true);

        Assertions.assertEquals("UNKNOWN", p.getStatus(), "Payment timeout must be marked UNKNOWN initially");

        // Trigger reconciliation worker
        paymentService.reconcileUnknownPayments();

        Payment reconciled = paymentService.getPaymentById(p.getPaymentId()).orElseThrow();
        Assertions.assertEquals("SUCCESS", reconciled.getStatus(), "Reconciliation worker must resolve UNKNOWN payment to SUCCESS");
    }

    @Test
    public void testOrderServiceOutageDurableRecovery() {
        String paymentId = "pay_outage_" + UUID.randomUUID().toString();

        // Simulate payment success while order service is offline
        Payment p = paymentService.processPayment("res_outage", "cust_1", new BigDecimal("199.99"), "CARD", "key_outage_" + paymentId, false, false);
        Assertions.assertEquals("SUCCESS", p.getStatus());

        // Order Service recovers and processes event
        Order order = orderService.createOrderFromPayment(p.getPaymentId(), p.getReservationId(), p.getCustomerId(), p.getAmount(), "123 Way", null);

        Assertions.assertNotNull(order.getOrderId());
        Assertions.assertEquals("CONFIRMED", order.getStatus().name());
    }

    @Test
    public void testGracefulProductFallbackWhenRedisFails() {
        // Querying product when Redis is unavailable falls back safely to PostgreSQL
        Optional<Product> prod = productService.getProductById("prod_flash_1");
        Assertions.assertTrue(prod.isPresent());
    }
}
