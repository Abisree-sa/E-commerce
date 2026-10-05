package com.salestorm.cart.controller;

import com.salestorm.cart.model.Cart;
import com.salestorm.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<Cart> createCart(@RequestParam(defaultValue = "cust_demo") String customerId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(customerId));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<Cart> getCart(@PathVariable String customerId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(customerId));
    }

    @PostMapping("/{customerId}/items")
    public ResponseEntity<Cart> addItem(
            @PathVariable String customerId,
            @RequestBody Cart.CartItem item
    ) {
        return ResponseEntity.ok(cartService.addItem(customerId, item));
    }

    @DeleteMapping("/{customerId}/items/{productId}")
    public ResponseEntity<Cart> removeItem(
            @PathVariable String customerId,
            @PathVariable String productId
    ) {
        return ResponseEntity.ok(cartService.removeItem(customerId, productId));
    }
}
