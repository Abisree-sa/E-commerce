package com.salestorm.payment.provider;

import java.math.BigDecimal;

public interface PaymentProvider {

    enum ProviderStatus {
        SUCCESS,
        FAILED,
        TIMEOUT_UNKNOWN
    }

    record ProviderResponse(ProviderStatus status, String transactionRef, String message) {}

    ProviderResponse processPayment(String reservationId, BigDecimal amount, String paymentMethod, boolean forceFailure, boolean forceTimeout);
    ProviderResponse queryTransactionStatus(String transactionRef);
}
