package com.enterprise.wallet.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String requestId;

    // ─── Constructors ──────────────────────────────────────────────────────────
    public ApiResponse() {}

    // ─── Static factory methods ───────────────────────────────────────────────
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        r.timestamp = LocalDateTime.now();
        return r;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.message = message;
        r.data = data;
        r.timestamp = LocalDateTime.now();
        return r;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.message = message;
        r.timestamp = LocalDateTime.now();
        return r;
    }

    // ─── Manual Builder (no Lombok) ───────────────────────────────────────────
    public static <T> Builder<T> builder() {
        return new Builder<>();
    }

    public static class Builder<T> {
        private boolean success;
        private String message;
        private T data;
        private LocalDateTime timestamp;
        private String requestId;

        public Builder<T> success(boolean success) { this.success = success; return this; }
        public Builder<T> message(String message)  { this.message = message; return this; }
        public Builder<T> data(T data)             { this.data = data; return this; }
        public Builder<T> timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public Builder<T> requestId(String requestId) { this.requestId = requestId; return this; }

        public ApiResponse<T> build() {
            ApiResponse<T> r = new ApiResponse<>();
            r.success   = this.success;
            r.message   = this.message;
            r.data      = this.data;
            r.timestamp = this.timestamp != null ? this.timestamp : LocalDateTime.now();
            r.requestId = this.requestId;
            return r;
        }
    }

    // ─── Getters & Setters ────────────────────────────────────────────────────
    public boolean isSuccess()                       { return success; }
    public void setSuccess(boolean success)          { this.success = success; }
    public String getMessage()                       { return message; }
    public void setMessage(String message)           { this.message = message; }
    public T getData()                               { return data; }
    public void setData(T data)                      { this.data = data; }
    public LocalDateTime getTimestamp()              { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp){ this.timestamp = timestamp; }
    public String getRequestId()                     { return requestId; }
    public void setRequestId(String requestId)       { this.requestId = requestId; }
}
