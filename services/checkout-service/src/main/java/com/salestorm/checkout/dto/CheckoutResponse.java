package com.salestorm.checkout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponse {
    private String checkoutId;
    private String reservationId;
    private String paymentId;
    private String orderId;
    private String status; // SUCCESS, OUT_OF_STOCK, PAYMENT_FAILED, RECONCILIATION_PENDING
    private String message;
    private BigDecimal totalAmount;
    private String idempotencyKey;
}
