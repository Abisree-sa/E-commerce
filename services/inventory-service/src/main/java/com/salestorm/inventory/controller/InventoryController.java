package com.salestorm.inventory.controller;

import com.salestorm.inventory.dto.ReservationRequest;
import com.salestorm.inventory.model.Inventory;
import com.salestorm.inventory.model.Reservation;
import com.salestorm.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/inventory/{productId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable String productId) {
        return inventoryService.getInventory(productId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/inventory/{productId}/seed")
    public ResponseEntity<Inventory> seedInventory(
            @PathVariable String productId,
            @RequestParam(defaultValue = "100") int stock
    ) {
        Inventory seeded = inventoryService.seedInventory(productId, stock);
        return ResponseEntity.ok(seeded);
    }

    @PostMapping("/reservations")
    public ResponseEntity<?> reserveInventory(
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @RequestBody ReservationRequest request
    ) {
        try {
            Reservation reservation = inventoryService.reserveInventory(
                    request.getProductId(),
                    request.getCustomerId() == null ? "cust_demo" : request.getCustomerId(),
                    request.getQuantity() <= 0 ? 1 : request.getQuantity(),
                    idempotencyKey
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
        } catch (InventoryService.OutOfStockException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("error", "OUT_OF_STOCK", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "BAD_REQUEST", "message", e.getMessage()));
        }
    }

    @PostMapping("/reservations/{id}/release")
    public ResponseEntity<Void> releaseReservation(@PathVariable String id) {
        inventoryService.releaseReservation(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reservations/{id}/confirm")
    public ResponseEntity<Void> confirmReservation(@PathVariable String id) {
        inventoryService.confirmReservation(id);
        return ResponseEntity.ok().build();
    }
}
