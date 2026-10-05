package com.salestorm.payment.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class MockPaymentProvider implements PaymentProvider {

    // Simulates external payment gateway state database for reconciliation
    private final Map<String, ProviderStatus> gatewayDatabase = new ConcurrentHashMap<>();

    @Override
    public ProviderResponse processPayment(String reservationId, BigDecimal amount, String paymentMethod, boolean forceFailure, boolean forceTimeout) {
        String txRef = "tx_" + UUID.randomUUID().toString().substring(0, 8);

        if (forceTimeout) {
            log.warn("MockPaymentProvider: Simulating NETWORK TIMEOUT for txRef {}", txRef);
            // Behind the scenes on gateway side, payment actually succeeded after delay!
            gatewayDatabase.put(txRef, ProviderStatus.SUCCESS);
            return new ProviderResponse(ProviderStatus.TIMEOUT_UNKNOWN, txRef, "Gateway connection timed out");
        }

        if (forceFailure) {
            log.info("MockPaymentProvider: Simulating PAYMENT FAILURE for txRef {}", txRef);
            gatewayDatabase.put(txRef, ProviderStatus.FAILED);
            return new ProviderResponse(ProviderStatus.FAILED, txRef, "Insufficient funds or card declined");
        }

        log.info("MockPaymentProvider: Payment SUCCESS for txRef {}", txRef);
        gatewayDatabase.put(txRef, ProviderStatus.SUCCESS);
        return new ProviderResponse(ProviderStatus.SUCCESS, txRef, "Transaction approved");
    }

    @Override
    public ProviderResponse queryTransactionStatus(String transactionRef) {
        ProviderStatus status = gatewayDatabase.getOrDefault(transactionRef, ProviderStatus.SUCCESS);
        log.info("MockPaymentProvider Reconciliation query for txRef {}: status = {}", transactionRef, status);
        return new ProviderResponse(status, transactionRef, "Reconciled status: " + status);
    }
}
