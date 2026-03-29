package com.enterprise.wallet.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class WithdrawRequest {

    @NotBlank(message = "Wallet ID is required")
    private String walletId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum withdrawal is 1.00")
    @Digits(integer = 10, fraction = 4)
    private BigDecimal amount;

    @Size(max = 500)
    private String description;

    @Size(max = 100)
    private String idempotencyKey;

    public WithdrawRequest() {}

    public String getWalletId() { return walletId; }
    public void setWalletId(String walletId) { this.walletId = walletId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
