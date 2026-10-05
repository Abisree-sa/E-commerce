package com.salestorm.product.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "is_flash_sale")
    private boolean flashSale;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Version
    @Column(nullable = false)
    private Integer version;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
        if (version == null) version = 1;
        if (rating == null) rating = new BigDecimal("4.5");
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = Instant.now();
    }
}
