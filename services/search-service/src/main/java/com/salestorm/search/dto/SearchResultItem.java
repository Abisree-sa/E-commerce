package com.salestorm.search.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultItem {
    private String id;
    private String name;
    private String description;
    private String category;
    private String brand;
    private BigDecimal price;
    private BigDecimal rating;
    private boolean flashSale;
    private String imageUrl;
    private Integer availableQuantity;
}
