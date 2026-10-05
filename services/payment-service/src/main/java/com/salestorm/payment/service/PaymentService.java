package com.salestorm.payment.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salestorm.payment.model.Payment;
import com.salestorm.payment.model.PaymentOutbox;
import com.salestorm.payment.provider.PaymentProvider;
import com.salestorm.payment.repository.PaymentOutboxRepository;
import com.salestorm.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentOutboxRepository outboxRepository;
    private final PaymentProvider paymentProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Optional<Payment> getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId);
    }

    /**
     * IDEMPOTENT PAYMENT PROCESSOR WITH OUTBOX EVENT INJECTION
     */
    @Transactional
    public Payment processPayment(
            String reservationId,
            String customerId,
            BigDecimal amount,
            String paymentMethod,
            String idempotencyKey,
            boolean simulateFailure,
            boolean simulateTimeout
    ) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency-Key header is required for payments");
        }

        // 1. Idempotency Check
        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            log.info("Idempotent hit for payment key {}. Returning existing payment {}", idempotencyKey, existing.get().getPaymentId());
            return existing.get();
        }

        String paymentId = "pay_" + UUID.randomUUID().toString().substring(0, 8);

        // 2. Call Payment Provider
        PaymentProvider.ProviderResponse response = paymentProvider.processPayment(
                reservationId, amount, paymentMethod, simulateFailure, simulateTimeout
        );

        String paymentStatus = switch (response.status()) {
            case SUCCESS -> "SUCCESS";
            case FAILED -> "FAILED";
            case TIMEOUT_UNKNOWN -> "UNKNOWN";
        };

        Payment payment = Payment.builder()
                .paymentId(paymentId)
                .reservationId(reservationId)
                .customerId(customerId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .status(paymentStatus)
                .transactionReference(response.transactionRef())
                .idempotencyKey(idempotencyKey)
                .failureReason(response.status() == PaymentProvider.ProviderStatus.FAILED ? response.message() : null)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // 3. Outbox Pattern: If SUCCESS, create durable event in payment_outbox within SAME transaction
        if ("SUCCESS".equals(paymentStatus)) {
            createPaymentSucceededOutboxEvent(savedPayment);
        }

        return savedPayment;
    }

    /**
     * PAYMENT TIMEOUT RECONCILIATION WORKER
     * Polls UNKNOWN payments, queries gateway, resolves status to SUCCESS or FAILED.
     */
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void reconcileUnknownPayments() {
        List<Payment> unknownPayments = paymentRepository.findByStatus("UNKNOWN");
        for (Payment p : unknownPayments) {
            log.info("Reconciling UNKNOWN payment {} (txRef: {})", p.getPaymentId(), p.getTransactionReference());
            PaymentProvider.ProviderResponse response = paymentProvider.queryTransactionStatus(p.getTransactionReference());

            if (response.status() == PaymentProvider.ProviderStatus.SUCCESS) {
                p.setStatus("SUCCESS");
                paymentRepository.save(p);
                createPaymentSucceededOutboxEvent(p);
                log.info("Reconciliation RESOLVED payment {} to SUCCESS", p.getPaymentId());
            } else if (response.status() == PaymentProvider.ProviderStatus.FAILED) {
                p.setStatus("FAILED");
                p.setFailureReason("Reconciled as failed");
                paymentRepository.save(p);
                log.info("Reconciliation RESOLVED payment {} to FAILED", p.getPaymentId());
            }
        }
    }

    private void createPaymentSucceededOutboxEvent(Payment payment) {
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("eventId", UUID.randomUUID().toString());
            payloadMap.put("eventType", "PaymentSucceeded");
            payloadMap.put("aggregateId", payment.getPaymentId());
            payloadMap.put("version", 1);
            payloadMap.put("occurredAt", Instant.now().toString());

            Map<String, Object> innerPayload = new HashMap<>();
            innerPayload.put("paymentId", payment.getPaymentId());
            innerPayload.put("reservationId", payment.getReservationId());
            innerPayload.put("customerId", payment.getCustomerId());
            innerPayload.put("amount", payment.getAmount());
            innerPayload.put("transactionReference", payment.getTransactionReference());
            payloadMap.put("payload", innerPayload);

            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            PaymentOutbox outbox = PaymentOutbox.builder()
                    .id(UUID.randomUUID().toString())
                    .aggregateType("Payment")
                    .aggregateId(payment.getPaymentId())
                    .eventType("PaymentSucceeded")
                    .payload(jsonPayload)
                    .status("PENDING")
                    .build();

            outboxRepository.save(outbox);
            log.info("Saved PaymentSucceeded event to payment_outbox for payment {}", payment.getPaymentId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to save payment outbox event", e);
        }
    }
}
