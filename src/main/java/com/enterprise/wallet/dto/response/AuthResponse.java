package com.enterprise.wallet.dto.response;

import com.enterprise.wallet.domain.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserResponse user;
    private LocalDateTime issuedAt;

    public AuthResponse() {}

    // ─── Getters / Setters ────────────────────────────────────────────────────
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    // ─── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private UserResponse user;
        private LocalDateTime issuedAt;

        public Builder accessToken(String v) { this.accessToken = v; return this; }
        public Builder refreshToken(String v) { this.refreshToken = v; return this; }
        public Builder tokenType(String v) { this.tokenType = v; return this; }
        public Builder expiresIn(long v) { this.expiresIn = v; return this; }
        public Builder user(UserResponse v) { this.user = v; return this; }
        public Builder issuedAt(LocalDateTime v) { this.issuedAt = v; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.accessToken = this.accessToken;
            r.refreshToken = this.refreshToken;
            r.tokenType = this.tokenType;
            r.expiresIn = this.expiresIn;
            r.user = this.user;
            r.issuedAt = this.issuedAt;
            return r;
        }
    }
}
