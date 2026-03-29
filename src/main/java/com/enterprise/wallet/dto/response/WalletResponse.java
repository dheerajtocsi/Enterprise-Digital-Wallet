package com.enterprise.wallet.dto.response;

import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.WalletStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class WalletResponse {
    private String id;
    private String walletAddress;
    private String walletName;
    private Currency currency;
    private BigDecimal balance;
    private BigDecimal availableBalance;
    private BigDecimal lockedBalance;
    private BigDecimal dailyLimit;
    private BigDecimal dailySpent;
    private WalletStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WalletResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getWalletAddress() { return walletAddress; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
    public String getWalletName() { return walletName; }
    public void setWalletName(String walletName) { this.walletName = walletName; }
    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public BigDecimal getAvailableBalance() { return availableBalance; }
    public void setAvailableBalance(BigDecimal availableBalance) { this.availableBalance = availableBalance; }
    public BigDecimal getLockedBalance() { return lockedBalance; }
    public void setLockedBalance(BigDecimal lockedBalance) { this.lockedBalance = lockedBalance; }
    public BigDecimal getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; }
    public BigDecimal getDailySpent() { return dailySpent; }
    public void setDailySpent(BigDecimal dailySpent) { this.dailySpent = dailySpent; }
    public WalletStatus getStatus() { return status; }
    public void setStatus(WalletStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, walletAddress, walletName;
        private Currency currency;
        private BigDecimal balance, availableBalance, lockedBalance, dailyLimit, dailySpent;
        private WalletStatus status;
        private LocalDateTime createdAt, updatedAt;

        public Builder id(String v) { this.id = v; return this; }
        public Builder walletAddress(String v) { this.walletAddress = v; return this; }
        public Builder walletName(String v) { this.walletName = v; return this; }
        public Builder currency(Currency v) { this.currency = v; return this; }
        public Builder balance(BigDecimal v) { this.balance = v; return this; }
        public Builder availableBalance(BigDecimal v) { this.availableBalance = v; return this; }
        public Builder lockedBalance(BigDecimal v) { this.lockedBalance = v; return this; }
        public Builder dailyLimit(BigDecimal v) { this.dailyLimit = v; return this; }
        public Builder dailySpent(BigDecimal v) { this.dailySpent = v; return this; }
        public Builder status(WalletStatus v) { this.status = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { this.updatedAt = v; return this; }

        public WalletResponse build() {
            WalletResponse r = new WalletResponse();
            r.id = id; r.walletAddress = walletAddress; r.walletName = walletName;
            r.currency = currency; r.balance = balance; r.availableBalance = availableBalance;
            r.lockedBalance = lockedBalance; r.dailyLimit = dailyLimit; r.dailySpent = dailySpent;
            r.status = status; r.createdAt = createdAt; r.updatedAt = updatedAt;
            return r;
        }
    }
}
