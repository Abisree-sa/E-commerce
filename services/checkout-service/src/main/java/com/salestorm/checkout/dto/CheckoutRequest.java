package com.salestorm.checkout.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    private String customerId = "cust_demo";
    private String productId = "prod_flash_1";
    private String productName = "Salestorm Ultra Edition";
    private int quantity = 1;
    private BigDecimal amount = new BigDecimal("199.99");
    private String shippingAddress = "123 Innovation Way, Tech City";
    private boolean simulateFailure = false;
    private boolean simulateTimeout = false;
}
