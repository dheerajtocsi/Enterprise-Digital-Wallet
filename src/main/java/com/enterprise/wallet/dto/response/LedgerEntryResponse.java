package com.enterprise.wallet.dto.response;

import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.LedgerEntryType;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LedgerEntryResponse {
    private String id;
    private String walletId;
    private String transactionId;
    private LedgerEntryType entryType;
    private BigDecimal amount;
    private Currency currency;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String description;
    private LocalDateTime createdAt;

    public LedgerEntryResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getWalletId() { return walletId; }
    public void setWalletId(String walletId) { this.walletId = walletId; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public LedgerEntryType getEntryType() { return entryType; }
    public void setEntryType(LedgerEntryType entryType) { this.entryType = entryType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public void setBalanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, walletId, transactionId, description;
        private LedgerEntryType entryType;
        private BigDecimal amount, balanceBefore, balanceAfter;
        private Currency currency;
        private LocalDateTime createdAt;

        public Builder id(String v) { this.id = v; return this; }
        public Builder walletId(String v) { this.walletId = v; return this; }
        public Builder transactionId(String v) { this.transactionId = v; return this; }
        public Builder entryType(LedgerEntryType v) { this.entryType = v; return this; }
        public Builder amount(BigDecimal v) { this.amount = v; return this; }
        public Builder currency(Currency v) { this.currency = v; return this; }
        public Builder balanceBefore(BigDecimal v) { this.balanceBefore = v; return this; }
        public Builder balanceAfter(BigDecimal v) { this.balanceAfter = v; return this; }
        public Builder description(String v) { this.description = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public LedgerEntryResponse build() {
            LedgerEntryResponse r = new LedgerEntryResponse();
            r.id = id; r.walletId = walletId; r.transactionId = transactionId;
            r.entryType = entryType; r.amount = amount; r.currency = currency;
            r.balanceBefore = balanceBefore; r.balanceAfter = balanceAfter;
            r.description = description; r.createdAt = createdAt;
            return r;
        }
    }
}
