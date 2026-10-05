package com.salestorm.payment.controller;

import com.salestorm.payment.dto.PaymentRequest;
import com.salestorm.payment.model.Payment;
import com.salestorm.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable String id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Payment> processPayment(
            @RequestHeader(value = "Idempotency-Key", required = true) String idempotencyKey,
            @RequestBody PaymentRequest request
    ) {
        Payment payment = paymentService.processPayment(
                request.getReservationId(),
                request.getCustomerId() == null ? "cust_demo" : request.getCustomerId(),
                request.getAmount(),
                request.getPaymentMethod(),
                idempotencyKey,
                request.isSimulateFailure(),
                request.isSimulateTimeout()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }
}
