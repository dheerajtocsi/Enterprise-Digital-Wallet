package com.enterprise.wallet.domain.enums;

/**
 * Supported currencies in the wallet system.
 */
public enum Currency {
    INR("Indian Rupee", "₹"),
    USD("US Dollar", "$"),
    EUR("Euro", "€"),
    GBP("British Pound", "£"),
    AED("UAE Dirham", "د.إ"),
    SGD("Singapore Dollar", "S$");

    private final String displayName;
    private final String symbol;

    Currency(String displayName, String symbol) {
        this.displayName = displayName;
        this.symbol = symbol;
    }

    public String getDisplayName() { return displayName; }
    public String getSymbol() { return symbol; }
}
