package com.salestorm.payment.repository;

import com.salestorm.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByTransactionReference(String transactionReference);
    List<Payment> findByStatus(String status);
}
