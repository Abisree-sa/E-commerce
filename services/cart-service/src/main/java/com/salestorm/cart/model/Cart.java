package com.salestorm.cart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    private String cartId;
    private String customerId;
    @Builder.Default
    private List<CartItem> items = new ArrayList<>();
    private BigDecimal totalPrice;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItem {
        private String productId;
        private String productName;
        private BigDecimal unitPrice;
        private int quantity;
        private String imageUrl;
    }

    public BigDecimal calculateTotalPrice() {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        return items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
