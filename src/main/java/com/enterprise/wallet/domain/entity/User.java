package com.enterprise.wallet.domain.entity;

import com.enterprise.wallet.domain.enums.UserRole;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "WALLET_USERS", indexes = {
        @Index(name = "IDX_USER_EMAIL", columnList = "email", unique = true),
        @Index(name = "IDX_USER_USERNAME", columnList = "username", unique = true)
})
public class User {

    @Id
    @Column(name = "USER_ID", columnDefinition = "VARCHAR(36)")
    private String id;

    @Column(name = "USERNAME", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "PASSWORD_HASH", nullable = false)
    private String passwordHash;

    @Column(name = "PHONE_ENCRYPTED", length = 500)
    private String phoneEncrypted;

    @Column(name = "GOV_ID_ENCRYPTED", length = 500)
    private String govIdEncrypted;

    @Column(name = "FULL_NAME", length = 200)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROLE", nullable = false, length = 20)
    private UserRole role = UserRole.ROLE_USER;

    @Column(name = "IS_ACTIVE", nullable = false)
    private Boolean isActive = true;

    @Column(name = "IS_EMAIL_VERIFIED", nullable = false)
    private Boolean isEmailVerified = false;

    @Column(name = "FAILED_LOGIN_ATTEMPTS", nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column(name = "LOCKED_UNTIL")
    private LocalDateTime lockedUntil;

    @Column(name = "LAST_LOGIN_AT")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Wallet> wallets = new ArrayList<>();

    // ─── Constructors ──────────────────────────────────────────────────────────
    public User() {}

    // ─── Getters ──────────────────────────────────────────────────────────────
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getPhoneEncrypted() { return phoneEncrypted; }
    public String getGovIdEncrypted() { return govIdEncrypted; }
    public String getFullName() { return fullName; }
    public UserRole getRole() { return role; }
    public Boolean getIsActive() { return isActive; }
    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public Integer getFailedLoginAttempts() { return failedLoginAttempts; }
    public LocalDateTime getLockedUntil() { return lockedUntil; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<Wallet> getWallets() { return wallets; }

    // ─── Setters ──────────────────────────────────────────────────────────────
    public void setId(String id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setPhoneEncrypted(String phoneEncrypted) { this.phoneEncrypted = phoneEncrypted; }
    public void setGovIdEncrypted(String govIdEncrypted) { this.govIdEncrypted = govIdEncrypted; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setRole(UserRole role) { this.role = role; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }
    public void setFailedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }
    public void setLockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public void setWallets(List<Wallet> wallets) { this.wallets = wallets; }

    // ─── Business methods ─────────────────────────────────────────────────────
    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    // ─── Builder ──────────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String username;
        private String email;
        private String passwordHash;
        private String phoneEncrypted;
        private String govIdEncrypted;
        private String fullName;
        private UserRole role = UserRole.ROLE_USER;
        private Boolean isActive = true;
        private Boolean isEmailVerified = false;
        private Integer failedLoginAttempts = 0;
        private LocalDateTime lockedUntil;
        private LocalDateTime lastLoginAt;
        private List<Wallet> wallets = new ArrayList<>();

        public Builder id(String id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder phoneEncrypted(String phoneEncrypted) { this.phoneEncrypted = phoneEncrypted; return this; }
        public Builder govIdEncrypted(String govIdEncrypted) { this.govIdEncrypted = govIdEncrypted; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(UserRole role) { this.role = role; return this; }
        public Builder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public Builder isEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; return this; }
        public Builder failedLoginAttempts(Integer failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; return this; }
        public Builder lockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; return this; }
        public Builder lastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; return this; }
        public Builder wallets(List<Wallet> wallets) { this.wallets = wallets; return this; }

        public User build() {
            User u = new User();
            u.id = this.id;
            u.username = this.username;
            u.email = this.email;
            u.passwordHash = this.passwordHash;
            u.phoneEncrypted = this.phoneEncrypted;
            u.govIdEncrypted = this.govIdEncrypted;
            u.fullName = this.fullName;
            u.role = this.role;
            u.isActive = this.isActive;
            u.isEmailVerified = this.isEmailVerified;
            u.failedLoginAttempts = this.failedLoginAttempts;
            u.lockedUntil = this.lockedUntil;
            u.lastLoginAt = this.lastLoginAt;
            u.wallets = this.wallets;
            return u;
        }
    }
}
