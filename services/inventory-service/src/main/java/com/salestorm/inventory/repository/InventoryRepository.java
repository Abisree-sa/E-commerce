package com.salestorm.inventory.repository;

import com.salestorm.inventory.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, String> {

    /**
     * CRITICAL ATOMIC CONDITIONAL UPDATE FOR ZERO OVERSELLING
     * Returns 1 if reservation succeeds, 0 if out of stock / failed.
     */
    @Modifying
    @Query("""
        UPDATE Inventory i
        SET i.availableQuantity = i.availableQuantity - :quantity,
            i.reservedQuantity = i.reservedQuantity + :quantity,
            i.version = i.version + 1,
            i.updatedAt = CURRENT_TIMESTAMP
        WHERE i.productId = :productId
          AND i.availableQuantity >= :quantity
    """)
    int reserveStockAtomic(@Param("productId") String productId, @Param("quantity") int quantity);

    /**
     * ATOMIC RELEASE OF EXPIRED OR CANCELLED RESERVATIONS
     */
    @Modifying
    @Query("""
        UPDATE Inventory i
        SET i.availableQuantity = i.availableQuantity + :quantity,
            i.reservedQuantity = i.reservedQuantity - :quantity,
            i.version = i.version + 1,
            i.updatedAt = CURRENT_TIMESTAMP
        WHERE i.productId = :productId
          AND i.reservedQuantity >= :quantity
    """)
    int releaseStockAtomic(@Param("productId") String productId, @Param("quantity") int quantity);

    /**
     * ATOMIC CONFIRMATION (RESERVED -> SOLD) UPON PAYMENT SUCCESS
     */
    @Modifying
    @Query("""
        UPDATE Inventory i
        SET i.reservedQuantity = i.reservedQuantity - :quantity,
            i.soldQuantity = i.soldQuantity + :quantity,
            i.version = i.version + 1,
            i.updatedAt = CURRENT_TIMESTAMP
        WHERE i.productId = :productId
          AND i.reservedQuantity >= :quantity
    """)
    int confirmStockAtomic(@Param("productId") String productId, @Param("quantity") int quantity);
}
