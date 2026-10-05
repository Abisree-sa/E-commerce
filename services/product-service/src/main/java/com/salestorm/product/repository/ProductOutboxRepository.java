package com.salestorm.product.repository;

import com.salestorm.product.model.ProductOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductOutboxRepository extends JpaRepository<ProductOutbox, String> {
    List<ProductOutbox> findByStatus(String status);
}
