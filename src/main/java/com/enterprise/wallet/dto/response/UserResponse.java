package com.enterprise.wallet.dto.response;

import com.enterprise.wallet.domain.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public UserResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id, username, email, fullName;
        private UserRole role;
        private Boolean isActive, isEmailVerified;
        private LocalDateTime lastLoginAt, createdAt;

        public Builder id(String v) { this.id = v; return this; }
        public Builder username(String v) { this.username = v; return this; }
        public Builder email(String v) { this.email = v; return this; }
        public Builder fullName(String v) { this.fullName = v; return this; }
        public Builder role(UserRole v) { this.role = v; return this; }
        public Builder isActive(Boolean v) { this.isActive = v; return this; }
        public Builder isEmailVerified(Boolean v) { this.isEmailVerified = v; return this; }
        public Builder lastLoginAt(LocalDateTime v) { this.lastLoginAt = v; return this; }
        public Builder createdAt(LocalDateTime v) { this.createdAt = v; return this; }

        public UserResponse build() {
            UserResponse r = new UserResponse();
            r.id = id; r.username = username; r.email = email; r.fullName = fullName;
            r.role = role; r.isActive = isActive; r.isEmailVerified = isEmailVerified;
            r.lastLoginAt = lastLoginAt; r.createdAt = createdAt;
            return r;
        }
    }
}
