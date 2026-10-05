package com.salestorm.demo;

import com.salestorm.checkout.dto.CheckoutRequest;
import com.salestorm.checkout.dto.CheckoutResponse;
import com.salestorm.checkout.service.CheckoutService;
import com.salestorm.inventory.model.Inventory;
import com.salestorm.inventory.service.InventoryService;
import com.salestorm.order.service.OrderService;
import com.salestorm.payment.service.PaymentService;
import com.salestorm.product.service.ProductService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DemoController {

    private final InventoryService inventoryService;
    private final CheckoutService checkoutService;
    private final PaymentService paymentService;
    private final OrderService orderService;
    private final ProductService productService;

    private boolean orderServiceActive = true;

    @Data
    public static class FlashSaleSimulationResult {
        private int totalRequests;
        private int initialStock;
        private int successfulReservations;
        private int outOfStockCount;
        private int availableQuantity;
        private int reservedQuantity;
        private int soldQuantity;
        private int oversold;
        private double executionTimeMs;
    }

    @PostMapping("/simulate-flash-sale")
    public ResponseEntity<FlashSaleSimulationResult> simulateFlashSale(
            @RequestParam(defaultValue = "prod_flash_1") String productId,
            @RequestParam(defaultValue = "100") int initialStock,
            @RequestParam(defaultValue = "10000") int requests
    ) {
        log.info("Starting FLASH SALE SIMULATION: {} concurrent requests for product {} (Stock: {})", requests, productId, initialStock);

        // Reset inventory to initial stock
        inventoryService.seedInventory(productId, initialStock);

        long startTime = System.currentTimeMillis();
        ExecutorService executor = Executors.newFixedThreadPool(100);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(requests);

        AtomicInteger successCounter = new AtomicInteger(0);
        AtomicInteger outOfStockCounter = new AtomicInteger(0);

        for (int i = 0; i < requests; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    latch.await();
                    String key = "flash_sim_" + index + "_" + UUID.randomUUID().toString().substring(0, 4);
                    inventoryService.reserveInventory(productId, "user_" + index, 1, key);
                    successCounter.incrementAndGet();
                } catch (InventoryService.OutOfStockException e) {
                    outOfStockCounter.incrementAndGet();
                } catch (Exception e) {
                    // Ignore non-stock error
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        latch.countDown(); // Unblock simultaneous execution
        try {
            doneLatch.await(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        executor.shutdown();

        long endTime = System.currentTimeMillis();

        Inventory inv = inventoryService.getInventory(productId).orElse(new Inventory());

        FlashSaleSimulationResult result = new FlashSaleSimulationResult();
        result.setTotalRequests(requests);
        result.setInitialStock(initialStock);
        result.setSuccessfulReservations(successCounter.get());
        result.setOutOfStockCount(outOfStockCounter.get());
        result.setAvailableQuantity(inv.getAvailableQuantity() != null ? inv.getAvailableQuantity() : 0);
        result.setReservedQuantity(inv.getReservedQuantity() != null ? inv.getReservedQuantity() : 0);
        result.setSoldQuantity(inv.getSoldQuantity() != null ? inv.getSoldQuantity() : 0);
        result.setOversold(inv.getAvailableQuantity() != null && inv.getAvailableQuantity() < 0 ? Math.abs(inv.getAvailableQuantity()) : 0);
        result.setExecutionTimeMs(endTime - startTime);

        log.info("FLASH SALE SIMULATION COMPLETED: Successful = {}, Out of Stock = {}, Oversold = {}",
                result.getSuccessfulReservations(), result.getOutOfStockCount(), result.getOversold());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/simulate-payment-failure")
    public ResponseEntity<CheckoutResponse> simulatePaymentFailure() {
        CheckoutRequest request = new CheckoutRequest();
        request.setProductId("prod_flash_1");
        request.setSimulateFailure(true);
        String key = "pay_fail_" + UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(checkoutService.processCheckout(key, request));
    }

    @PostMapping("/simulate-payment-timeout")
    public ResponseEntity<CheckoutResponse> simulatePaymentTimeout() {
        CheckoutRequest request = new CheckoutRequest();
        request.setProductId("prod_flash_1");
        request.setSimulateTimeout(true);
        String key = "pay_timeout_" + UUID.randomUUID().toString().substring(0, 8);
        return ResponseEntity.ok(checkoutService.processCheckout(key, request));
    }

    @PostMapping("/toggle-order-service")
    public ResponseEntity<Map<String, Object>> toggleOrderService(@RequestParam boolean active) {
        this.orderServiceActive = active;
        log.info("Order Service Active Status toggled to: {}", active);
        return ResponseEntity.ok(Map.of("orderServiceActive", active, "message", active ? "Order Service is RUNNING" : "Order Service is DOWN (Simulated Outage)"));
    }

    @PostMapping("/expire-reservations")
    public ResponseEntity<Map<String, String>> expireReservations() {
        inventoryService.processExpiredReservations();
        return ResponseEntity.ok(Map.of("message", "Triggered reservation expiry worker successfully. Expired stock released to available inventory."));
    }
}
