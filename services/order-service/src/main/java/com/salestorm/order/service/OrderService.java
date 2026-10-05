package com.salestorm.order.service;

import com.salestorm.order.model.*;
import com.salestorm.order.repository.OrderRepository;
import com.salestorm.order.repository.OrderStateHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderStateHistoryRepository stateHistoryRepository;

    public Optional<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public List<Order> getOrdersByCustomer(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    /**
     * IDEMPOTENT ORDER CREATION FROM PAYMENT SUCCEEDED EVENT
     */
    @Transactional
    public Order createOrderFromPayment(
            String paymentId,
            String reservationId,
            String customerId,
            BigDecimal amount,
            String shippingAddress,
            List<OrderItem> items
    ) {
        // Step 1: Idempotency & Duplicate Prevention Invariant
        Optional<Order> existing = orderRepository.findByPaymentId(paymentId);
        if (existing.isPresent()) {
            log.info("Idempotent Order Creation: Order already exists for paymentId {}. Returning order {}", paymentId, existing.get().getOrderId());
            return existing.get();
        }

        String orderId = "ord_" + UUID.randomUUID().toString().substring(0, 8);
        Order order = Order.builder()
                .orderId(orderId)
                .paymentId(paymentId)
                .reservationId(reservationId)
                .customerId(customerId)
                .totalAmount(amount)
                .status(OrderStatus.CONFIRMED) // Direct transition upon successful payment
                .shippingAddress(shippingAddress == null || shippingAddress.isBlank() ? "123 Innovation Way, Tech City" : shippingAddress)
                .build();

        if (items != null) {
            for (OrderItem item : items) {
                if (item.getId() == null) item.setId("item_" + UUID.randomUUID().toString().substring(0, 8));
                item.setOrder(order);
            }
            order.setItems(items);
        }

        Order savedOrder = orderRepository.save(order);

        // Record State Transition History
        recordStateTransition(orderId, null, OrderStatus.CONFIRMED.name(), "Order created upon PaymentSucceeded event");

        log.info("Successfully created Order {} for paymentId {}", orderId, paymentId);
        return savedOrder;
    }

    /**
     * ORDER STATE MACHINE TRANSITION ENFORCER
     */
    @Transactional
    public Order updateOrderStatus(String orderId, OrderStatus newStatus, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        OrderStatus currentStatus = order.getStatus();

        if (!currentStatus.canTransitionTo(newStatus)) {
            log.error("Invalid Order State Transition attempt from {} to {} for order {}", currentStatus, newStatus, orderId);
            throw new IllegalStateException("Cannot transition order from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        recordStateTransition(orderId, currentStatus.name(), newStatus.name(), reason);
        log.info("Order {} transitioned from {} to {}", orderId, currentStatus, newStatus);
        return updated;
    }

    private void recordStateTransition(String orderId, String fromStatus, String toStatus, String reason) {
        OrderStateHistory history = OrderStateHistory.builder()
                .id("hist_" + UUID.randomUUID().toString().substring(0, 8))
                .orderId(orderId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .reason(reason)
                .build();
        stateHistoryRepository.save(history);
    }
}
