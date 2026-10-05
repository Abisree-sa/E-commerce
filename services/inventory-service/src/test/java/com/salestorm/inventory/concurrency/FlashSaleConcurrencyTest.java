package com.salestorm.inventory.concurrency;

import com.salestorm.inventory.model.Inventory;
import com.salestorm.inventory.service.InventoryService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@SpringBootTest
public class FlashSaleConcurrencyTest {

    @Autowired
    private InventoryService inventoryService;

    @Test
    public void testHighVolumeConcurrentReservationsNoOverselling() throws Exception {
        String productId = "prod_flash_concurrency_test";
        int initialStock = 100;
        int totalRequests = 10000;

        // Seed initial 100 stock
        inventoryService.seedInventory(productId, initialStock);

        ExecutorService executor = Executors.newFixedThreadPool(100);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalRequests);

        AtomicInteger successfulReservations = new AtomicInteger(0);
        AtomicInteger outOfStockCounter = new AtomicInteger(0);

        for (int i = 0; i < totalRequests; i++) {
            final int index = i;
            executor.submit(() -> {
                try {
                    latch.await(); // Wait for all threads to align
                    String idempotencyKey = "key_test_" + index;
                    inventoryService.reserveInventory(productId, "user_" + index, 1, idempotencyKey);
                    successfulReservations.incrementAndGet();
                } catch (InventoryService.OutOfStockException e) {
                    outOfStockCounter.incrementAndGet();
                } catch (Exception e) {
                    // Ignore or record unexpected errors
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Release latch to start simultaneous execution
        latch.countDown();
        boolean completed = doneLatch.await(60, TimeUnit.SECONDS);
        executor.shutdown();

        Inventory finalInventory = inventoryService.getInventory(productId).orElseThrow();

        System.out.println("=================================================================");
        System.out.println("              FLASH SALE CONCURRENCY TEST REPORT                 ");
        System.out.println("=================================================================");
        System.out.println("Total requests:               " + totalRequests);
        System.out.println("Initial Stock:                " + initialStock);
        System.out.println("Successful reservations:      " + successfulReservations.get());
        System.out.println("Out of stock responses:       " + outOfStockCounter.get());
        System.out.println("Final Available Quantity:     " + finalInventory.getAvailableQuantity());
        System.out.println("Final Reserved Quantity:      " + finalInventory.getReservedQuantity());
        System.out.println("Oversold Count:               " + (finalInventory.getAvailableQuantity() < 0 ? Math.abs(finalInventory.getAvailableQuantity()) : 0));
        System.out.println("=================================================================");

        // STRICT INVARIANT ASSERTIONS
        Assertions.assertTrue(completed, "Concurrency test timed out");
        Assertions.assertTrue(successfulReservations.get() <= 100, "CRITICAL FAILURE: Oversold stock! Successful reservations exceeded 100");
        Assertions.assertEquals(100, successfulReservations.get(), "Expected exactly 100 successful reservations for 100 stock");
        Assertions.assertEquals(0, finalInventory.getAvailableQuantity(), "Available quantity must be exactly 0 after full stock reservation");
        Assertions.assertEquals(100, finalInventory.getReservedQuantity(), "Reserved quantity must match total successful reservations");
        Assertions.assertTrue(finalInventory.getAvailableQuantity() >= 0, "Available quantity must never be negative");
    }
}
