package com.enterprise.wallet.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class TransferRequest {

    @NotBlank(message = "Source wallet ID is required")
    private String fromWalletId;

    @NotBlank(message = "Destination wallet address is required")
    private String toWalletAddress;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum transfer is 1.00")
    @DecimalMax(value = "100000.00", message = "Maximum single transfer is 1,00,000")
    @Digits(integer = 10, fraction = 4)
    private BigDecimal amount;

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String idempotencyKey;

    public TransferRequest() {}

    public String getFromWalletId() { return fromWalletId; }
    public void setFromWalletId(String fromWalletId) { this.fromWalletId = fromWalletId; }
    public String getToWalletAddress() { return toWalletAddress; }
    public void setToWalletAddress(String toWalletAddress) { this.toWalletAddress = toWalletAddress; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
