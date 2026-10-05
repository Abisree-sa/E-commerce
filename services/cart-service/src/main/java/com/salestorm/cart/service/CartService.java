package com.salestorm.cart.service;

import com.salestorm.cart.model.Cart;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    // Concurrent in-memory / Redis-backed cart store
    private final Map<String, Cart> cartStore = new ConcurrentHashMap<>();

    public Cart getOrCreateCart(String customerId) {
        return cartStore.computeIfAbsent(customerId, id -> Cart.builder()
                .cartId("cart_" + UUID.randomUUID().toString().substring(0, 8))
                .customerId(id)
                .items(new ArrayList<>())
                .totalPrice(BigDecimal.ZERO)
                .build());
    }

    public Cart addItem(String customerId, Cart.CartItem item) {
        Cart cart = getOrCreateCart(customerId);
        Optional<Cart.CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(item.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + item.getQuantity());
        } else {
            cart.getItems().add(item);
        }

        cart.setTotalPrice(cart.calculateTotalPrice());
        log.info("Added item {} to cart for customer {}", item.getProductId(), customerId);
        return cart;
    }

    public Cart removeItem(String customerId, String productId) {
        Cart cart = getOrCreateCart(customerId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        cart.setTotalPrice(cart.calculateTotalPrice());
        return cart;
    }

    public void clearCart(String customerId) {
        Cart cart = getOrCreateCart(customerId);
        cart.getItems().clear();
        cart.setTotalPrice(BigDecimal.ZERO);
    }
}
