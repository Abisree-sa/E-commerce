package com.salestorm.recommendation.controller;

import com.salestorm.recommendation.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<RecommendationService.RecommendedProduct>> getRecommendations(
            @RequestParam(required = false, defaultValue = "cust_demo") String customerId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand
    ) {
        // Seed catalog for recommendations demonstration
        List<RecommendationService.RecommendedProduct> seedCatalog = List.of(
                new RecommendationService.RecommendedProduct("prod_nike_air", "Nike Air Zoom Flash", "footwear", "Nike", new BigDecimal("149.99"), 0, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"),
                new RecommendationService.RecommendedProduct("prod_adidas_ultraboost", "Adidas Ultraboost 22", "footwear", "Adidas", new BigDecimal("180.00"), 0, "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=80"),
                new RecommendationService.RecommendedProduct("prod_apple_watch", "Apple Watch Ultra Flash Edition", "electronics", "Apple", new BigDecimal("799.00"), 0, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=500&q=80"),
                new RecommendationService.RecommendedProduct("prod_sony_headphones", "Sony WH-1000XM5 Noise Canceling", "electronics", "Sony", new BigDecimal("399.99"), 0, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80")
        );

        List<RecommendationService.RecommendedProduct> results = recommendationService.getRecommendations(customerId, category, brand, seedCatalog);
        return ResponseEntity.ok(results);
    }
}
