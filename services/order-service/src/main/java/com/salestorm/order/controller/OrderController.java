package com.salestorm.order.controller;

import com.salestorm.order.model.Order;
import com.salestorm.order.model.OrderStatus;
import com.salestorm.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrdersByCustomer(
            @RequestParam(defaultValue = "cust_demo") String customerId
    ) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false, defaultValue = "Manual status update") String reason
    ) {
        try {
            Order updated = orderService.updateOrderStatus(id, status, reason);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "INVALID_STATE_TRANSITION", "message", e.getMessage()));
        }
    }
}
