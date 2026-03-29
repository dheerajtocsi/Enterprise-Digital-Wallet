package com.enterprise.wallet.domain.entity;

import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.TransactionStatus;
import com.enterprise.wallet.domain.enums.TransactionType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "TRANSACTIONS", indexes = {
        @Index(name = "IDX_TXN_WALLET", columnList = "wallet_id"),
        @Index(name = "IDX_TXN_STATUS", columnList = "status"),
        @Index(name = "IDX_TXN_CREATED", columnList = "created_at"),
        @Index(name = "IDX_TXN_IDEMPOTENCY", columnList = "idempotency_key", unique = true),
        @Index(name = "IDX_TXN_WALLET_CREATED", columnList = "wallet_id,created_at"),
        @Index(name = "IDX_TXN_REFERENCE", columnList = "reference_id")
})
public class Transaction {

    @Id
    @Column(name = "TRANSACTION_ID", columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(name = "IDEMPOTENCY_KEY", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WALLET_ID", nullable = false)
    private Wallet wallet;

    @Column(name = "COUNTERPART_WALLET_ID", length = 36)
    private String counterpartWalletId;

    @Enumerated(EnumType.STRING)
    @Column(name = "TYPE", nullable = false, length = 20)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "AMOUNT", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "FEE", precision = 19, scale = 4)
    private BigDecimal fee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "CURRENCY", nullable = false, length = 10)
    private Currency currency;

    @Column(name = "BALANCE_BEFORE", precision = 19, scale = 4)
    private BigDecimal balanceBefore;

    @Column(name = "BALANCE_AFTER", precision = 19, scale = 4)
    private BigDecimal balanceAfter;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(name = "REFERENCE_ID", length = 100)
    private String referenceId;

    @Column(name = "METADATA", length = 2000)
    private String metadata;

    @Column(name = "IP_ADDRESS", length = 45)
    private String ipAddress;

    @Column(name = "FAILURE_REASON", length = 500)
    private String failureReason;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "COMPLETED_AT")
    private LocalDateTime completedAt;

    // ─── Constructors ──────────────────────────────────────────────────────────
    public Transaction() {}

    // ─── Getters ──────────────────────────────────────────────────────────────
    public String getId() { return id; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public Wallet getWallet() { return wallet; }
    public String getCounterpartWalletId() { return counterpartWalletId; }
    public TransactionType getType() { return type; }
    public TransactionStatus getStatus() { return status; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getFee() { return fee; }
    public Currency getCurrency() { return currency; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getDescription() { return description; }
    public String getReferenceId() { return referenceId; }
    public String getMetadata() { return metadata; }
    public String getIpAddress() { return ipAddress; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    // ─── Setters ──────────────────────────────────────────────────────────────
    public void setId(String id) { this.id = id; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public void setWallet(Wallet wallet) { this.wallet = wallet; }
    public void setCounterpartWalletId(String counterpartWalletId) { this.counterpartWalletId = counterpartWalletId; }
    public void setType(TransactionType type) { this.type = type; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setFee(BigDecimal fee) { this.fee = fee; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public void setBalanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    public void setDescription(String description) { this.description = description; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    @PrePersist
    public void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
        if (this.idempotencyKey == null) this.idempotencyKey = UUID.randomUUID().toString();
    }

    // ─── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String idempotencyKey;
        private Wallet wallet;
        private String counterpartWalletId;
        private TransactionType type;
        private TransactionStatus status = TransactionStatus.PENDING;
        private BigDecimal amount;
        private BigDecimal fee = BigDecimal.ZERO;
        private Currency currency;
        private BigDecimal balanceBefore;
        private BigDecimal balanceAfter;
        private String description;
        private String referenceId;
        private String metadata;
        private String ipAddress;
        private String failureReason;
        private LocalDateTime completedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder idempotencyKey(String k) { this.idempotencyKey = k; return this; }
        public Builder wallet(Wallet w) { this.wallet = w; return this; }
        public Builder counterpartWalletId(String id) { this.counterpartWalletId = id; return this; }
        public Builder type(TransactionType t) { this.type = t; return this; }
        public Builder status(TransactionStatus s) { this.status = s; return this; }
        public Builder amount(BigDecimal a) { this.amount = a; return this; }
        public Builder fee(BigDecimal f) { this.fee = f; return this; }
        public Builder currency(Currency c) { this.currency = c; return this; }
        public Builder balanceBefore(BigDecimal b) { this.balanceBefore = b; return this; }
        public Builder balanceAfter(BigDecimal b) { this.balanceAfter = b; return this; }
        public Builder description(String d) { this.description = d; return this; }
        public Builder referenceId(String r) { this.referenceId = r; return this; }
        public Builder metadata(String m) { this.metadata = m; return this; }
        public Builder ipAddress(String ip) { this.ipAddress = ip; return this; }
        public Builder failureReason(String fr) { this.failureReason = fr; return this; }
        public Builder completedAt(LocalDateTime t) { this.completedAt = t; return this; }

        public Transaction build() {
            Transaction t = new Transaction();
            t.id = this.id;
            t.idempotencyKey = this.idempotencyKey;
            t.wallet = this.wallet;
            t.counterpartWalletId = this.counterpartWalletId;
            t.type = this.type;
            t.status = this.status;
            t.amount = this.amount;
            t.fee = this.fee;
            t.currency = this.currency;
            t.balanceBefore = this.balanceBefore;
            t.balanceAfter = this.balanceAfter;
            t.description = this.description;
            t.referenceId = this.referenceId;
            t.metadata = this.metadata;
            t.ipAddress = this.ipAddress;
            t.failureReason = this.failureReason;
            t.completedAt = this.completedAt;
            return t;
        }
    }
}
