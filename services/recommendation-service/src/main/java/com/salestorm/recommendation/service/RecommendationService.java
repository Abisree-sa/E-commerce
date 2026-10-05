package com.salestorm.recommendation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedProduct {
        private String productId;
        private String name;
        private String category;
        private String brand;
        private BigDecimal price;
        private double recommendationScore;
        private String imageUrl;
    }

    public List<RecommendedProduct> getRecommendations(String customerId, String targetCategory, String targetBrand, List<RecommendedProduct> availableCatalog) {
        String cacheKey = "rec:" + (customerId == null ? "anon" : customerId) + ":cat=" + (targetCategory == null ? "" : targetCategory) + ":brand=" + (targetBrand == null ? "" : targetBrand);

        // Check Redis Cache
        try {
            if (redisTemplate != null) {
                String cached = redisTemplate.opsForValue().get(cacheKey);
                if (cached != null && !cached.isEmpty()) {
                    log.info("Redis HIT for recommendations key: {}", cacheKey);
                    return objectMapper.readValue(cached, objectMapper.getTypeFactory().constructCollectionType(List.class, RecommendedProduct.class));
                }
            }
        } catch (Exception e) {
            log.warn("Redis cache check failed for recommendations: {}", e.getMessage());
        }

        if (availableCatalog == null || availableCatalog.isEmpty()) {
            return Collections.emptyList();
        }

        // Weighted Scoring Algorithm: score = (catMatch * 0.4) + (brandMatch * 0.2) + (popularity * 0.2) + (recentBehaviour * 0.2)
        List<RecommendedProduct> scored = new ArrayList<>();
        Random random = new Random(42);

        for (RecommendedProduct p : availableCatalog) {
            double catMatch = (targetCategory != null && targetCategory.equalsIgnoreCase(p.getCategory())) ? 1.0 : 0.2;
            double brandMatch = (targetBrand != null && targetBrand.equalsIgnoreCase(p.getBrand())) ? 1.0 : 0.3;
            double popularity = 0.5 + (random.nextDouble() * 0.5);
            double recentBehaviour = (customerId != null) ? 0.8 : 0.5;

            double score = (catMatch * 0.4) + (brandMatch * 0.2) + (popularity * 0.2) + (recentBehaviour * 0.2);
            p.setRecommendationScore(Math.round(score * 100.0) / 100.0);
            scored.add(p);
        }

        scored.sort(Comparator.comparing(RecommendedProduct::getRecommendationScore).reversed());

        // Cache in Redis (300 seconds)
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(scored), 300, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            log.warn("Failed to cache recommendations in Redis: {}", e.getMessage());
        }

        return scored;
    }
}
