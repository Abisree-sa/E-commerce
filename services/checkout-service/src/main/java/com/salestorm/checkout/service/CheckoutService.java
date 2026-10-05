package com.salestorm.checkout.service;

import com.salestorm.checkout.dto.CheckoutRequest;
import com.salestorm.checkout.dto.CheckoutResponse;
import com.salestorm.inventory.model.Reservation;
import com.salestorm.inventory.service.InventoryService;
import com.salestorm.order.model.Order;
import com.salestorm.order.model.OrderItem;
import com.salestorm.order.service.OrderService;
import com.salestorm.payment.model.Payment;
import com.salestorm.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final OrderService orderService;

    public CheckoutResponse processCheckout(String idempotencyKey, CheckoutRequest request) {
        log.info("Starting Checkout flow for product {} (qty: {})...", request.getProductId(), request.getQuantity());

        String resIdempotencyKey = "res_" + idempotencyKey;
        String payIdempotencyKey = "pay_" + idempotencyKey;

        // Step 1: Reserve Inventory
        Reservation reservation;
        try {
            reservation = inventoryService.reserveInventory(
                    request.getProductId(),
                    request.getCustomerId(),
                    request.getQuantity(),
                    resIdempotencyKey
            );
        } catch (InventoryService.OutOfStockException e) {
            log.warn("Checkout FAILED: OUT OF STOCK for product {}", request.getProductId());
            return CheckoutResponse.builder()
                    .checkoutId("chk_" + UUID.randomUUID().toString().substring(0, 8))
                    .status("OUT_OF_STOCK")
                    .message("Flash sale item is out of stock!")
                    .idempotencyKey(idempotencyKey)
                    .build();
        }

        // Step 2: Process Payment
        Payment payment = paymentService.processPayment(
                reservation.getReservationId(),
                request.getCustomerId(),
                request.getAmount(),
                "CREDIT_CARD",
                payIdempotencyKey,
                request.isSimulateFailure(),
                request.isSimulateTimeout()
        );

        if ("FAILED".equals(payment.getStatus())) {
            log.warn("Checkout FAILED: Payment declined. Releasing reservation {}", reservation.getReservationId());
            inventoryService.releaseReservation(reservation.getReservationId());
            return CheckoutResponse.builder()
                    .checkoutId("chk_" + UUID.randomUUID().toString().substring(0, 8))
                    .reservationId(reservation.getReservationId())
                    .paymentId(payment.getPaymentId())
                    .status("PAYMENT_FAILED")
                    .message("Payment was declined: " + payment.getFailureReason())
                    .totalAmount(request.getAmount())
                    .idempotencyKey(idempotencyKey)
                    .build();
        }

        if ("UNKNOWN".equals(payment.getStatus())) {
            log.info("Checkout PENDING: Payment timed out. Scheduled for background reconciliation");
            return CheckoutResponse.builder()
                    .checkoutId("chk_" + UUID.randomUUID().toString().substring(0, 8))
                    .reservationId(reservation.getReservationId())
                    .paymentId(payment.getPaymentId())
                    .status("RECONCILIATION_PENDING")
                    .message("Payment connection timed out. System is reconciling with gateway.")
                    .totalAmount(request.getAmount())
                    .idempotencyKey(idempotencyKey)
                    .build();
        }

        // Step 3: Payment Success -> Create Order & Confirm Stock
        inventoryService.confirmReservation(reservation.getReservationId());

        OrderItem item = OrderItem.builder()
                .id("item_" + UUID.randomUUID().toString().substring(0, 8))
                .productId(request.getProductId())
                .productName(request.getProductName())
                .unitPrice(request.getAmount())
                .quantity(request.getQuantity())
                .build();

        Order order = orderService.createOrderFromPayment(
                payment.getPaymentId(),
                reservation.getReservationId(),
                request.getCustomerId(),
                request.getAmount(),
                request.getShippingAddress(),
                List.of(item)
        );

        log.info("Checkout SUCCESS: Created Order {}", order.getOrderId());
        return CheckoutResponse.builder()
                .checkoutId("chk_" + UUID.randomUUID().toString().substring(0, 8))
                .reservationId(reservation.getReservationId())
                .paymentId(payment.getPaymentId())
                .orderId(order.getOrderId())
                .status("SUCCESS")
                .message("Checkout completed successfully! Order confirmed.")
                .totalAmount(request.getAmount())
                .idempotencyKey(idempotencyKey)
                .build();
    }
}
