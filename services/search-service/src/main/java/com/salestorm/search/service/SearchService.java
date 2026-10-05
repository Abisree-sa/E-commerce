package com.salestorm.search.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salestorm.search.dto.SearchResponse;
import com.salestorm.search.dto.SearchResultItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory catalog database for OpenSearch fallback / demonstration index
    private final List<SearchResultItem> mockProductCatalog = Collections.synchronizedList(new ArrayList<>());

    public void registerProductInIndex(SearchResultItem item) {
        mockProductCatalog.removeIf(p -> p.getId().equals(item.getId()));
        mockProductCatalog.add(item);
        log.info("Product {} indexed in search engine read model", item.getId());
    }

    public SearchResponse search(
            String q,
            String category,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal rating,
            Boolean availability,
            String sort,
            int page,
            int size
    ) {
        // Build deterministic parameter-aware cache key
        String cacheKey = buildCacheKey(q, category, brand, minPrice, maxPrice, rating, availability, sort, page, size);

        // Step 1: Redis HIT check
        try {
            if (redisTemplate != null) {
                String cachedJson = redisTemplate.opsForValue().get(cacheKey);
                if (cachedJson != null && !cachedJson.isEmpty()) {
                    log.info("Redis CACHE HIT for key: {}", cacheKey);
                    SearchResponse response = objectMapper.readValue(cachedJson, SearchResponse.class);
                    response.setCached(true);
                    response.setCacheKey(cacheKey);
                    return response;
                }
            }
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to OpenSearch read model directly: {}", e.getMessage());
        }

        log.info("Redis CACHE MISS for key: {}. Querying OpenSearch index...", cacheKey);

        // Step 2: Query OpenSearch / Read Model Index
        List<SearchResultItem> filtered = mockProductCatalog.stream()
                .filter(item -> q == null || q.isBlank() ||
                        item.getName().toLowerCase().contains(q.toLowerCase()) ||
                        (item.getDescription() != null && item.getDescription().toLowerCase().contains(q.toLowerCase())))
                .filter(item -> category == null || category.isBlank() || item.getCategory().equalsIgnoreCase(category))
                .filter(item -> brand == null || brand.isBlank() || item.getBrand().equalsIgnoreCase(brand))
                .filter(item -> minPrice == null || item.getPrice().compareTo(minPrice) >= 0)
                .filter(item -> maxPrice == null || item.getPrice().compareTo(maxPrice) <= 0)
                .filter(item -> rating == null || item.getRating().compareTo(rating) >= 0)
                .filter(item -> availability == null || !availability || (item.getAvailableQuantity() != null && item.getAvailableQuantity() > 0))
                .collect(Collectors.toList());

        // Step 3: Sorting
        if ("price_asc".equalsIgnoreCase(sort)) {
            filtered.sort(Comparator.comparing(SearchResultItem::getPrice));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            filtered.sort(Comparator.comparing(SearchResultItem::getPrice).reversed());
        } else if ("rating_desc".equalsIgnoreCase(sort)) {
            filtered.sort(Comparator.comparing(SearchResultItem::getRating).reversed());
        }

        // Step 4: Pagination
        int totalHits = filtered.size();
        int fromIndex = Math.min((page - 1) * size, totalHits);
        int toIndex = Math.min(fromIndex + size, totalHits);

        List<SearchResultItem> pageItems = (fromIndex <= toIndex) ? filtered.subList(fromIndex, toIndex) : Collections.emptyList();
        int totalPages = (int) Math.ceil((double) totalHits / size);

        SearchResponse response = SearchResponse.builder()
                .items(pageItems)
                .totalHits(totalHits)
                .page(page)
                .size(size)
                .totalPages(totalPages)
                .cached(false)
                .cacheKey(cacheKey)
                .build();

        // Step 5: Store in Redis Cache with TTL (300 seconds)
        try {
            if (redisTemplate != null) {
                String jsonStr = objectMapper.writeValueAsString(response);
                redisTemplate.opsForValue().set(cacheKey, jsonStr, 300, TimeUnit.SECONDS);
                log.info("Cached search response in Redis key {} (TTL: 300s)", cacheKey);
            }
        } catch (Exception e) {
            log.warn("Failed to write search response to Redis cache: {}", e.getMessage());
        }

        return response;
    }

    private String buildCacheKey(
            String q, String category, String brand,
            BigDecimal minPrice, BigDecimal maxPrice, BigDecimal rating,
            Boolean availability, String sort, int page, int size
    ) {
        StringBuilder sb = new StringBuilder("search:");
        sb.append("q=").append(q == null ? "" : q.trim().toLowerCase()).append(":");
        sb.append("cat=").append(category == null ? "" : category.trim().toLowerCase()).append(":");
        sb.append("brand=").append(brand == null ? "" : brand.trim().toLowerCase()).append(":");
        sb.append("min=").append(minPrice == null ? "" : minPrice.toString()).append(":");
        sb.append("max=").append(maxPrice == null ? "" : maxPrice.toString()).append(":");
        sb.append("rat=").append(rating == null ? "" : rating.toString()).append(":");
        sb.append("avail=").append(availability == null ? "" : availability.toString()).append(":");
        sb.append("sort=").append(sort == null ? "default" : sort.toLowerCase()).append(":");
        sb.append("p=").append(page).append(":");
        sb.append("s=").append(size);
        return sb.toString();
    }
}
