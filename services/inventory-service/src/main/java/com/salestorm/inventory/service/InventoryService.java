package com.salestorm.inventory.service;

import com.salestorm.inventory.model.Inventory;
import com.salestorm.inventory.model.Reservation;
import com.salestorm.inventory.repository.InventoryRepository;
import com.salestorm.inventory.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ReservationRepository reservationRepository;

    public Optional<Inventory> getInventory(String productId) {
        return inventoryRepository.findById(productId);
    }

    @Transactional
    public Inventory seedInventory(String productId, int initialStock) {
        Inventory inv = inventoryRepository.findById(productId)
                .orElse(Inventory.builder()
                        .productId(productId)
                        .availableQuantity(initialStock)
                        .reservedQuantity(0)
                        .soldQuantity(0)
                        .version(1)
                        .build());
        inv.setAvailableQuantity(initialStock);
        inv.setReservedQuantity(0);
        inv.setSoldQuantity(0);
        return inventoryRepository.save(inv);
    }

    /**
     * IDEMPOTENT ATOMIC RESERVATION PROCESSOR
     */
    @Transactional
    public Reservation reserveInventory(String productId, String customerId, int quantity, String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency-Key header is required");
        }

        // Step 1: Idempotency Check
        Optional<Reservation> existing = reservationRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Idempotent hit for key: {}. Returning existing reservation {}", idempotencyKey, existing.get().getReservationId());
            return existing.get();
        }

        // Ensure inventory record exists
        Inventory inv = inventoryRepository.findById(productId)
                .orElseGet(() -> seedInventory(productId, 100)); // Default seed if not exists

        // Step 2: Atomic Conditional SQL Update
        int rowsAffected = inventoryRepository.reserveStockAtomic(productId, quantity);

        if (rowsAffected == 0) {
            log.warn("OUT OF STOCK for product {}. Requested qty: {}, Available stock insufficient", productId, quantity);
            throw new OutOfStockException("Out of stock for product " + productId);
        }

        // Step 3: Create Reservation Record
        Instant now = Instant.now();
        Instant expiresAt = now.plus(10, ChronoUnit.MINUTES); // 10 minutes expiry TTL

        Reservation reservation = Reservation.builder()
                .reservationId("res_" + UUID.randomUUID().toString().substring(0, 8))
                .productId(productId)
                .customerId(customerId)
                .quantity(quantity)
                .status("RESERVED")
                .idempotencyKey(idempotencyKey)
                .expiresAt(expiresAt)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return reservationRepository.save(reservation);
    }

    @Transactional
    public void releaseReservation(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        if (!"RESERVED".equals(reservation.getStatus()) && !"PAYMENT_PENDING".equals(reservation.getStatus())) {
            log.info("Reservation {} already in final status {}", reservationId, reservation.getStatus());
            return;
        }

        inventoryRepository.releaseStockAtomic(reservation.getProductId(), reservation.getQuantity());
        reservation.setStatus("RELEASED");
        reservationRepository.save(reservation);
        log.info("Released reservation {} and returned {} units to product {}", reservationId, reservation.getQuantity(), reservation.getProductId());
    }

    @Transactional
    public void confirmReservation(String reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        if ("CONFIRMED".equals(reservation.getStatus()) || "SOLD".equals(reservation.getStatus())) {
            return;
        }

        inventoryRepository.confirmStockAtomic(reservation.getProductId(), reservation.getQuantity());
        reservation.setStatus("CONFIRMED");
        reservationRepository.save(reservation);
        log.info("Confirmed reservation {} (converted {} units to SOLD) for product {}", reservationId, reservation.getQuantity(), reservation.getProductId());
    }

    /**
     * SCHEDULED EXPIRY WORKER - Automatically runs every 5 seconds to release expired stock
     */
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processExpiredReservations() {
        Instant now = Instant.now();
        List<Reservation> expired = reservationRepository.findExpiredReservations(now);

        for (Reservation r : expired) {
            log.info("Processing expired reservation {} (expiresAt: {})", r.getReservationId(), r.getExpiresAt());
            releaseReservation(r.getReservationId());
        }
    }

    public static class OutOfStockException extends RuntimeException {
        public OutOfStockException(String message) {
            super(message);
        }
    }
}
