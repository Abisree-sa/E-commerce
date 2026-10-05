package com.salestorm.order.model;

import java.util.Set;

public enum OrderStatus {
    CREATED,
    PAYMENT_PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus nextStatus) {
        if (this == nextStatus) return true;

        return switch (this) {
            case CREATED -> Set.of(PAYMENT_PENDING, CONFIRMED, CANCELLED).contains(nextStatus);
            case PAYMENT_PENDING -> Set.of(CONFIRMED, CANCELLED).contains(nextStatus);
            case CONFIRMED -> Set.of(PROCESSING, CANCELLED).contains(nextStatus);
            case PROCESSING -> Set.of(SHIPPED, CANCELLED).contains(nextStatus);
            case SHIPPED -> Set.of(OUT_FOR_DELIVERY).contains(nextStatus);
            case OUT_FOR_DELIVERY -> Set.of(DELIVERED).contains(nextStatus);
            case DELIVERED, CANCELLED -> false; // Terminal states
        };
    }
}
