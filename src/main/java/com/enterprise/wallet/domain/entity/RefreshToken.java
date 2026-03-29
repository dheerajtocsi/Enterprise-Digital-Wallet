package com.enterprise.wallet.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "REFRESH_TOKENS", indexes = {
        @Index(name = "IDX_RT_TOKEN", columnList = "token", unique = true),
        @Index(name = "IDX_RT_USER", columnList = "user_id")
})
public class RefreshToken {

    @Id
    @Column(name = "TOKEN_ID", columnDefinition = "VARCHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TOKEN", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "EXPIRES_AT", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "IS_REVOKED", nullable = false)
    private Boolean isRevoked = false;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─── Constructors ──────────────────────────────────────────────────────────
    public RefreshToken() {}

    // ─── Getters ──────────────────────────────────────────────────────────────
    public String getId() { return id; }
    public User getUser() { return user; }
    public String getToken() { return token; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public Boolean getIsRevoked() { return isRevoked; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ─── Setters ──────────────────────────────────────────────────────────────
    public void setId(String id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setToken(String token) { this.token = token; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public void setIsRevoked(Boolean isRevoked) { this.isRevoked = isRevoked; }

    // ─── Business methods ─────────────────────────────────────────────────────
    public boolean isExpired() { return LocalDateTime.now().isAfter(expiresAt); }
    public boolean isValid() { return !isRevoked && !isExpired(); }

    @PrePersist
    public void prePersist() {
        if (this.id == null) this.id = UUID.randomUUID().toString();
    }

    // ─── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private User user;
        private String token;
        private LocalDateTime expiresAt;
        private Boolean isRevoked = false;

        public Builder id(String id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder token(String token) { this.token = token; return this; }
        public Builder expiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; return this; }
        public Builder isRevoked(Boolean isRevoked) { this.isRevoked = isRevoked; return this; }

        public RefreshToken build() {
            RefreshToken rt = new RefreshToken();
            rt.id = this.id;
            rt.user = this.user;
            rt.token = this.token;
            rt.expiresAt = this.expiresAt;
            rt.isRevoked = this.isRevoked;
            return rt;
        }
    }
}
