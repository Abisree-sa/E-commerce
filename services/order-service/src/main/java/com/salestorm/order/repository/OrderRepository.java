package com.salestorm.order.repository;

import com.salestorm.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Optional<Order> findByPaymentId(String paymentId);
    List<Order> findByCustomerId(String customerId);
}
