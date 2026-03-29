package com.enterprise.wallet.domain.entity;

import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.LedgerEntryType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Immutable
@Table(name = "LEDGER_ENTRIES", indexes = {
        @Index(name = "IDX_LEDGER_WALLET", columnList = "wallet_id"),
        @Index(name = "IDX_LEDGER_TXN", columnList = "transaction_id"),
        @Index(name = "IDX_LEDGER_CREATED", columnList = "created_at"),
        @Index(name = "IDX_LEDGER_WALLET_CREATED", columnList = "wallet_id,created_at")
})
public class LedgerEntry {

    @Id
    @Column(name = "ENTRY_ID", columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(name = "WALLET_ID", nullable = false, length = 36)
    private String walletId;

    @Column(name = "TRANSACTION_ID", nullable = false, length = 36)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ENTRY_TYPE", nullable = false, length = 10)
    private LedgerEntryType entryType;

    @Column(name = "AMOUNT", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "CURRENCY", nullable = false, length = 10)
    private Currency currency;

    @Column(name = "BALANCE_BEFORE", nullable = false, precision = 19, scale = 4)
    private BigDecimal balanceBefore;

    @Column(name = "BALANCE_AFTER", nullable = false, precision = 19, scale = 4)
    private BigDecimal balanceAfter;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─── Constructors ──────────────────────────────────────────────────────────
    public LedgerEntry() {}

    // ─── Getters (no setters — immutable) ─────────────────────────────────────
    public String getId() { return id; }
    public String getWalletId() { return walletId; }
    public String getTransactionId() { return transactionId; }
    public LedgerEntryType getEntryType() { return entryType; }
    public BigDecimal getAmount() { return amount; }
    public Currency getCurrency() { return currency; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    @PrePersist
    public void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
    }

    // ─── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String walletId;
        private String transactionId;
        private LedgerEntryType entryType;
        private BigDecimal amount;
        private Currency currency;
        private BigDecimal balanceBefore;
        private BigDecimal balanceAfter;
        private String description;

        public Builder id(String id) { this.id = id; return this; }
        public Builder walletId(String walletId) { this.walletId = walletId; return this; }
        public Builder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public Builder entryType(LedgerEntryType entryType) { this.entryType = entryType; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder currency(Currency currency) { this.currency = currency; return this; }
        public Builder balanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; return this; }
        public Builder balanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; return this; }
        public Builder description(String description) { this.description = description; return this; }

        public LedgerEntry build() {
            LedgerEntry e = new LedgerEntry();
            e.id = this.id;
            e.walletId = this.walletId;
            e.transactionId = this.transactionId;
            e.entryType = this.entryType;
            e.amount = this.amount;
            e.currency = this.currency;
            e.balanceBefore = this.balanceBefore;
            e.balanceAfter = this.balanceAfter;
            e.description = this.description;
            return e;
        }
    }
}
