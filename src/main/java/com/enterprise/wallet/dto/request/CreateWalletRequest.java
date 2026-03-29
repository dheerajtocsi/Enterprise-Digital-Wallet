package com.enterprise.wallet.dto.request;

import com.enterprise.wallet.domain.enums.Currency;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateWalletRequest {

    @NotNull(message = "Currency is required")
    private Currency currency;

    @Size(max = 100, message = "Wallet name must not exceed 100 characters")
    private String walletName;

    public CreateWalletRequest() {}

    public Currency getCurrency() { return currency; }
    public void setCurrency(Currency currency) { this.currency = currency; }
    public String getWalletName() { return walletName; }
    public void setWalletName(String walletName) { this.walletName = walletName; }
}
