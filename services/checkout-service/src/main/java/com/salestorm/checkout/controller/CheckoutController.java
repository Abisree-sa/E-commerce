package com.salestorm.checkout.controller;

import com.salestorm.checkout.dto.CheckoutRequest;
import com.salestorm.checkout.dto.CheckoutResponse;
import com.salestorm.checkout.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    public ResponseEntity<CheckoutResponse> processCheckout(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody CheckoutRequest request
    ) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            idempotencyKey = "chk_idem_" + UUID.randomUUID().toString().substring(0, 8);
        }
        CheckoutResponse response = checkoutService.processCheckout(idempotencyKey, request);
        return ResponseEntity.ok(response);
    }
}
