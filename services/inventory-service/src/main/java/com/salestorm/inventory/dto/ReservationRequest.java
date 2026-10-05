package com.salestorm.inventory.dto;

import lombok.Data;

@Data
public class ReservationRequest {
    private String productId;
    private String customerId;
    private int quantity = 1;
}
