package com.salestorm.payment.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String reservationId;
    private String customerId;
    private BigDecimal amount;
    private String paymentMethod = "CREDIT_CARD";
    private boolean simulateFailure = false;
    private boolean simulateTimeout = false;
}
