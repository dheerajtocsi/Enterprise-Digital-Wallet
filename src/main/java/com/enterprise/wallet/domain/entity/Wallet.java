package com.enterprise.wallet.domain.entity;

import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.WalletStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "WALLETS", indexes = {
        @Index(name = "IDX_WALLET_USER", columnList = "user_id"),
        @Index(name = "IDX_WALLET_ADDRESS", columnList = "wallet_address", unique = true),
        @Index(name = "IDX_WALLET_STATUS", columnList = "status")
})
public class Wallet {

    @Id
    @Column(name = "WALLET_ID", columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(name = "WALLET_ADDRESS", nullable = false, unique = true, length = 30)
    private String walletAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "CURRENCY", nullable = false, length = 10)
    private Currency currency = Currency.INR;

    @Column(name = "BALANCE", nullable = false, precision = 19, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "LOCKED_BALANCE", nullable = false, precision = 19, scale = 4)
    private BigDecimal lockedBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    private WalletStatus status = WalletStatus.ACTIVE;

    @Column(name = "WALLET_NAME", length = 100)
    private String walletName;

    @Column(name = "DAILY_LIMIT", precision = 19, scale = 4)
    private BigDecimal dailyLimit = new BigDecimal("100000.00");

    @Column(name = "DAILY_SPENT", precision = 19, scale = 4)
    private BigDecimal dailySpent = BigDecimal.ZERO;

    @Column(name = "DAILY_RESET_AT")
    private LocalDateTime dailyResetAt;

    @Version
    @Column(name = "VERSION", nullable = false)
    private Long version;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>();

    // ─── Constructors ──────────────────────────────────────────────────────────
    public Wallet() {}

    // ─── Getters ──────────────────────────────────────────────────────────────
    public String getId() { return id; }
    public String getWalletAddress() { return walletAddress; }
    public User getUser() { return user; }
    public Currency getCurrency() { return currency; }
    public BigDecimal getBalance() { return balance; }
    public BigDecimal getLockedBalance() { return lockedBalance; }
    public WalletStatus getStatus() { return status; }
    public String getWalletName() { return walletName; }
    public BigDecimal getDailyLimit() { return dailyLimit; }
    public BigDecimal getDailySpent() { return dailySpent; }
    public LocalDateTime getDailyResetAt() { return dailyResetAt; }
    public Long getVersion() { return version; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<Transaction> getTransactions() { return transactions; }

    // ─── Setters ──────────────────────────────────────────────────────────────
    public void setId(String id) { this.id = id; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
    public void setUser(User user) { this.user = user; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public void setLockedBalance(BigDecimal lockedBalance) { this.lockedBalance = lockedBalance; }
    public void setStatus(WalletStatus status) { this.status = status; }
    public void setWalletName(String walletName) { this.walletName = walletName; }
    public void setDailyLimit(BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; }
    public void setDailySpent(BigDecimal dailySpent) { this.dailySpent = dailySpent; }
    public void setDailyResetAt(LocalDateTime dailyResetAt) { this.dailyResetAt = dailyResetAt; }
    public void setVersion(Long version) { this.version = version; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

    // ─── Business methods ─────────────────────────────────────────────────────
    public BigDecimal getAvailableBalance() {
        return balance.subtract(lockedBalance);
    }

    public boolean isActive() {
        return WalletStatus.ACTIVE.equals(this.status);
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.dailyResetAt == null) {
            this.dailyResetAt = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0);
        }
    }

    // ─── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String walletAddress;
        private User user;
        private Currency currency = Currency.INR;
        private BigDecimal balance = BigDecimal.ZERO;
        private BigDecimal lockedBalance = BigDecimal.ZERO;
        private WalletStatus status = WalletStatus.ACTIVE;
        private String walletName;
        private BigDecimal dailyLimit = new BigDecimal("100000.00");
        private BigDecimal dailySpent = BigDecimal.ZERO;
        private LocalDateTime dailyResetAt;
        private Long version = 0L;
        private List<Transaction> transactions = new ArrayList<>();

        public Builder id(String id) { this.id = id; return this; }
        public Builder walletAddress(String walletAddress) { this.walletAddress = walletAddress; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder currency(Currency currency) { this.currency = currency; return this; }
        public Builder balance(BigDecimal balance) { this.balance = balance; return this; }
        public Builder lockedBalance(BigDecimal lockedBalance) { this.lockedBalance = lockedBalance; return this; }
        public Builder status(WalletStatus status) { this.status = status; return this; }
        public Builder walletName(String walletName) { this.walletName = walletName; return this; }
        public Builder dailyLimit(BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; return this; }
        public Builder dailySpent(BigDecimal dailySpent) { this.dailySpent = dailySpent; return this; }
        public Builder dailyResetAt(LocalDateTime dailyResetAt) { this.dailyResetAt = dailyResetAt; return this; }
        public Builder version(Long version) { this.version = version; return this; }
        public Builder transactions(List<Transaction> transactions) { this.transactions = transactions; return this; }

        public Wallet build() {
            Wallet w = new Wallet();
            w.id = this.id;
            w.walletAddress = this.walletAddress;
            w.user = this.user;
            w.currency = this.currency;
            w.balance = this.balance;
            w.lockedBalance = this.lockedBalance;
            w.status = this.status;
            w.walletName = this.walletName;
            w.dailyLimit = this.dailyLimit;
            w.dailySpent = this.dailySpent;
            w.dailyResetAt = this.dailyResetAt;
            w.version = this.version;
            w.transactions = this.transactions;
            return w;
        }
    }
}
