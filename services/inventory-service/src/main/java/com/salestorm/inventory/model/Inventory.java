package com.salestorm.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @Column(name = "product_id", nullable = false)
    private String productId;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity;

    @Column(name = "sold_quantity", nullable = false)
    private Integer soldQuantity;

    @Version
    @Column(nullable = false)
    private Integer version;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        if (updatedAt == null) updatedAt = Instant.now();
        if (reservedQuantity == null) reservedQuantity = 0;
        if (soldQuantity == null) soldQuantity = 0;
        if (version == null) version = 1;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
