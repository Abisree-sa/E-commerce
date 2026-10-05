package com.salestorm.inventory.repository;

import com.salestorm.inventory.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {

    Optional<Reservation> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'RESERVED' AND r.expiresAt <= :now")
    List<Reservation> findExpiredReservations(@Param("now") Instant now);
}
