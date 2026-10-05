package com.salestorm;

import com.salestorm.inventory.service.InventoryService;
import com.salestorm.product.model.Product;
import com.salestorm.product.service.ProductService;
import com.salestorm.search.dto.SearchResultItem;
import com.salestorm.search.service.SearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication(scanBasePackages = "com.salestorm")
@EnableJpaRepositories(basePackages = "com.salestorm")
@EntityScan(basePackages = "com.salestorm")
@EnableScheduling
@Slf4j
public class SalestormApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalestormApplication.class, args);
        log.info("=================================================================");
        log.info("  SALESTORM E-COMMERCE FLASH SALE PLATFORM INITIALIZED ");
        log.info("=================================================================");
    }

    @Bean
    public CommandLineRunner dataSeeder(
            ProductService productService,
            InventoryService inventoryService,
            SearchService searchService
    ) {
        return args -> {
            log.info("Seeding initial flash-sale product catalog & stock...");

            List<Product> seedProducts = List.of(
                    Product.builder()
                            .id("prod_flash_1")
                            .name("SALESTORM Ultra Edition Pro 15")
                            .description("Next-generation high performance laptop for gaming and development. 100 Units Flash Sale Exclusive.")
                            .category("electronics")
                            .brand("SalestormTech")
                            .price(new BigDecimal("1299.99"))
                            .rating(new BigDecimal("4.9"))
                            .flashSale(true)
                            .imageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80")
                            .build(),
                    Product.builder()
                            .id("prod_running_1")
                            .name("Nike Air Zoom Flash Running Shoes")
                            .description("Ultralight carbon-plate running shoes engineered for peak speed.")
                            .category("footwear")
                            .brand("Nike")
                            .price(new BigDecimal("199.99"))
                            .rating(new BigDecimal("4.8"))
                            .flashSale(true)
                            .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80")
                            .build(),
                    Product.builder()
                            .id("prod_headphones_1")
                            .name("Sony WH-1000XM5 Wireless Headphones")
                            .description("Industry leading noise canceling headphones with dual processors.")
                            .category("electronics")
                            .brand("Sony")
                            .price(new BigDecimal("349.99"))
                            .rating(new BigDecimal("4.7"))
                            .flashSale(false)
                            .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80")
                            .build()
            );

            for (Product p : seedProducts) {
                if (productService.getProductById(p.getId()).isEmpty()) {
                    productService.createProduct(p);
                    inventoryService.seedInventory(p.getId(), p.isFlashSale() ? 100 : 500);

                    searchService.registerProductInIndex(SearchResultItem.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .description(p.getDescription())
                            .category(p.getCategory())
                            .brand(p.getBrand())
                            .price(p.getPrice())
                            .rating(p.getRating())
                            .flashSale(p.isFlashSale())
                            .imageUrl(p.getImageUrl())
                            .availableQuantity(p.isFlashSale() ? 100 : 500)
                            .build());
                }
            }

            log.info("Catalog & Inventory seeded successfully! 100 units ready for flash sale.");
        };
    }
}
