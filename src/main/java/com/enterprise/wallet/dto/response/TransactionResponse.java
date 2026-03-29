package com.enterprise.wallet.dto.response;

import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.TransactionStatus;
import com.enterprise.wallet.domain.enums.TransactionType;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionResponse {
    private String id;
    private String idempotencyKey;
    private String walletId;
    private String counterpartWalletId;
    private TransactionType type;
    private TransactionStatus status;
    private BigDecimal amount;
    private BigDecimal fee;
    private Currency currency;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String description;
    private String referenceId;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public TransactionResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public String getWalletId() { return walletId; }
    public void setWalletId(String walletId) { this.walletId = walletId; }
    public String getCounterpartWalletId() { return counterpartWalletId; }
    public void setCounterpartWalletId(String counterpartWalletId) { this.counterpartWalletId = counterpartWalletId; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getFee() { return fee; }
    public void setFee(BigDecimal fee) { this.fee = fee; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public void setBalanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, idempotencyKey, walletId, counterpartWalletId, description, referenceId, failureReason;
        private TransactionType type;
        private TransactionStatus status;
        private BigDecimal amount, fee, balanceBefore, balanceAfter;
        private Currency currency;
        private LocalDateTime createdAt, completedAt;

        public Builder id(String v) { this.id = v; return this; }
        public Builder idempotencyKey(String v) { this.idempotencyKey = v; return this; }
        public Builder walletId(String v) { this.walletId = v; return this; }
        public Builder counterpartWalletId(String v) { this.counterpartWalletId = v; return this; }
        public Builder type(TransactionType v) { this.type = v; return this; }
        public Builder status(TransactionStatus v) { this.status = v; return this; }
        public Builder amount(BigDecimal v) { this.amount = v; return this; }
        public Builder fee(BigDecimal v) { this.fee = v; return this; }
        public Builder currency(Currency v) { this.currency = v; return this; }
        public Builder balanceBefore(BigDecimal v) { this.balanceBefore = v; return this; }
        public Builder balanceAfter(BigDecimal v) { this.balanceAfter = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder referenceId(String v) { this.referenceId = v; return this; }
        public Builder failureReason(String v) { this.failureReason = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public Builder completedAt(LocalDateTime v) { this.completedAt = v; return this; }

        public TransactionResponse build() {
            TransactionResponse r = new TransactionResponse();
            r.id = id; r.idempotencyKey = idempotencyKey; r.walletId = walletId;
            r.counterpartWalletId = counterpartWalletId; r.type = type; r.status = status;
            r.amount = amount; r.fee = fee; r.currency = currency;
            r.balanceBefore = balanceBefore; r.balanceAfter = balanceAfter;
            r.description = description; r.referenceId = referenceId; r.failureReason = failureReason;
            r.createdAt = createdAt; r.completedAt = completedAt;
            return r;
        }
    }
}
