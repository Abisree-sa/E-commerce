package com.salestorm.product.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salestorm.product.model.Product;
import com.salestorm.product.model.ProductOutbox;
import com.salestorm.product.repository.ProductOutboxRepository;
import com.salestorm.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductOutboxRepository outboxRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * REDIS PRODUCT CACHING WITH GRACEFUL DEGRADATION FALLBACK
     * Checks Redis key `prod:{id}`. If Redis is down or key missed, queries DB safely.
     */
    public Optional<Product> getProductById(String id) {
        String cacheKey = "prod:" + id;

        // 1. Try Cache Hit
        try {
            if (redisTemplate != null) {
                String cachedJson = redisTemplate.opsForValue().get(cacheKey);
                if (cachedJson != null && !cachedJson.isEmpty()) {
                    log.info("Redis CACHE HIT for product key: {}", cacheKey);
                    return Optional.of(objectMapper.readValue(cachedJson, Product.class));
                }
            }
        } catch (Exception e) {
            log.warn("Redis unavailable for product lookup, falling back gracefully to PostgreSQL DB: {}", e.getMessage());
        }

        // 2. Cache Miss / Fallback → Query PostgreSQL DB
        log.info("Querying PostgreSQL Product DB for product id: {}", id);
        Optional<Product> productOpt = productRepository.findById(id);

        // 3. Write back to Redis Cache with 300s TTL if present
        if (productOpt.isPresent()) {
            try {
                if (redisTemplate != null) {
                    redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(productOpt.get()), 300, TimeUnit.SECONDS);
                    log.info("Cached product in Redis key {} (TTL: 300s)", cacheKey);
                }
            } catch (Exception e) {
                log.warn("Failed to write product to Redis cache: {}", e.getMessage());
            }
        }

        return productOpt;
    }

    @Transactional
    public Product createProduct(Product product) {
        if (product.getId() == null || product.getId().isEmpty()) {
            product.setId("prod_" + UUID.randomUUID().toString().substring(0, 8));
        }
        Product saved = productRepository.save(product);

        // Transactional Outbox Pattern: Save event in outbox table within same DB transaction
        createOutboxEvent(saved, "ProductCreated");

        return saved;
    }

    @Transactional
    public Product updateProduct(String id, Product updatedProduct) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setCategory(updatedProduct.getCategory());
        existing.setBrand(updatedProduct.getBrand());
        existing.setPrice(updatedProduct.getPrice());
        existing.setRating(updatedProduct.getRating());
        existing.setFlashSale(updatedProduct.isFlashSale());
        existing.setImageUrl(updatedProduct.getImageUrl());
        existing.setVersion(existing.getVersion() + 1);

        Product saved = productRepository.save(existing);
        createOutboxEvent(saved, "ProductUpdated");

        // Invalidate Redis Cache on update
        try {
            if (redisTemplate != null) {
                redisTemplate.delete("prod:" + id);
            }
        } catch (Exception e) {
            log.warn("Failed to invalidate Redis product cache: {}", e.getMessage());
        }

        return saved;
    }

    @Transactional
    public void deleteProduct(String id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
        productRepository.deleteById(id);

        ProductOutbox outbox = ProductOutbox.builder()
                .id(UUID.randomUUID().toString())
                .aggregateType("Product")
                .aggregateId(id)
                .eventType("ProductDeleted")
                .payload("{\"id\":\"" + id + "\",\"version\":" + (existing.getVersion() + 1) + "}")
                .status("PENDING")
                .build();
        outboxRepository.save(outbox);

        try {
            if (redisTemplate != null) {
                redisTemplate.delete("prod:" + id);
            }
        } catch (Exception e) {
            log.warn("Failed to delete Redis product cache: {}", e.getMessage());
        }
    }

    private void createOutboxEvent(Product product, String eventType) {
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("eventId", UUID.randomUUID().toString());
            payloadMap.put("eventType", eventType);
            payloadMap.put("aggregateId", product.getId());
            payloadMap.put("version", product.getVersion());
            payloadMap.put("occurredAt", Instant.now().toString());
            payloadMap.put("payload", product);

            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            ProductOutbox outbox = ProductOutbox.builder()
                    .id(UUID.randomUUID().toString())
                    .aggregateType("Product")
                    .aggregateId(product.getId())
                    .eventType(eventType)
                    .payload(jsonPayload)
                    .status("PENDING")
                    .build();

            outboxRepository.save(outbox);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate outbox event", e);
        }
    }
}
