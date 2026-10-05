package com.salestorm.order.repository;

import com.salestorm.order.model.OrderStateHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStateHistoryRepository extends JpaRepository<OrderStateHistory, String> {
    List<OrderStateHistory> findByOrderId(String orderId);
}
