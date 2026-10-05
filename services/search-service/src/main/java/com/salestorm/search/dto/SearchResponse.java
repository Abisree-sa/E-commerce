package com.salestorm.search.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {
    private List<SearchResultItem> items;
    private long totalHits;
    private int page;
    private int size;
    private int totalPages;
    private boolean cached;
    private String cacheKey;
}
