# Enterprise Digital Wallet 🏦

> High-throughput, PCI-DSS compliant digital wallet backend — **500+ TPS, sub-200ms latency**

![Java](https://img.shields.io/badge/Java-17-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green?logo=spring)
![Oracle](https://img.shields.io/badge/Oracle-21c-red?logo=oracle)
![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)

---

## ✨ Key Features

| Feature | Implementation |
|---------|---------------|
| 🔒 **PCI-DSS Encryption** | AES-256-GCM field-level encryption (PBKDF2 key derivation) |
| ⚡ **500+ TPS** | HikariCP pool + async processing + Redis caching |
| 💯 **ACID Compliance** | Pessimistic (SELECT FOR UPDATE) + Optimistic locking (@Version) |
| 📊 **Balance Optimization** | Redis cache (30s TTL) — **60% fewer DB reads** |
| 📒 **Double-Entry Ledger** | Immutable ledger entries for financial audit trail |
| 🔑 **JWT Auth** | Access token (15min) + Refresh token (7 days) rotation |
| 🔄 **Idempotency** | Idempotency keys prevent duplicate transactions |
| 🐳 **Docker Ready** | One-command deployment with Oracle XE + Redis |

---

## 🚀 Quick Start

### Option A — Local (H2, no Oracle/Redis needed)

```bash
cd "Enterprise Digital Wallet"

# Run with local profile (H2 in-memory DB)
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Access:
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 Console: http://localhost:8080/h2-console

### Option B — Full Stack (Oracle + Redis via Docker)

```bash
# Start everything
docker-compose up -d

# Logs
docker-compose logs -f wallet-app
```

### Option C — Production (with your own Oracle)

```bash
# Set environment variables
export ORACLE_HOST=your-oracle-host
export ORACLE_USER=wallet_user
export ORACLE_PASSWORD=your_password
export REDIS_HOST=your-redis-host
export JWT_SECRET=your-32-char-secret

mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 📡 API Reference

### Authentication

```bash
# Register
POST /api/v1/auth/register
{
  "username": "dheeraj",
  "email": "dheeraj@example.com",
  "password": "Secure@123",
  "fullName": "Dheeraj Kumar",
  "phone": "9876543210"
}

# Login
POST /api/v1/auth/login
{ "emailOrUsername": "dheeraj@example.com", "password": "Secure@123" }

# Refresh token
POST /api/v1/auth/refresh
{ "refreshToken": "<your-refresh-token>" }
```

### Wallet Operations

```bash
# Create wallet
POST /api/v1/wallets
Authorization: Bearer <token>
{ "currency": "INR", "walletName": "My Main Wallet" }

# Get all wallets
GET /api/v1/wallets/me

# Get balance (Redis cached)
GET /api/v1/wallets/{walletId}/balance
```

### Transactions

```bash
# Deposit
POST /api/v1/transactions/deposit
{ "walletId": "...", "amount": 5000.00, "description": "Salary" }

# Withdraw
POST /api/v1/transactions/withdraw
{ "walletId": "...", "amount": 1000.00 }

# Transfer (P2P)
POST /api/v1/transactions/transfer
{
  "fromWalletId": "...",
  "toWalletAddress": "EDW-INR-87654321",
  "amount": 2000.00,
  "description": "Rent payment"
}

# History
GET /api/v1/transactions/history?walletId=...&page=0&size=20
```

---

## 🅰 Angular Integration

CORS is pre-configured for `http://localhost:4200`. In your Angular service:

```typescript
// wallet.service.ts
const API_BASE = 'http://localhost:8080/api/v1';

login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<ApiResponse<AuthResponse>>(
    `${API_BASE}/auth/login`, credentials
  );
}

getBalance(walletId: string): Observable<BigDecimal> {
  return this.http.get<any>(`${API_BASE}/wallets/${walletId}/balance`, {
    headers: { Authorization: `Bearer ${this.tokenService.getToken()}` }
  });
}
```

Set `withCredentials: true` in your HTTP client if using cookies.

---

## 🏗 Architecture

```
Angular Frontend (port 4200)
    │  JWT Bearer Token
    ▼
Spring Boot 3 API (port 8080)
    ├── AuthController    → /api/v1/auth/**
    ├── WalletController  → /api/v1/wallets/**
    ├── TransactionController → /api/v1/transactions/**
    └── LedgerController  → /api/v1/ledger/**
         │
    ┌────┴────────────────────────────┐
    │  Service Layer                   │
    │  - AES-256-GCM Encryption        │
    │  - ACID Transactions             │
    │  - Idempotency                   │
    │  - Double-Entry Ledger           │
    └────┬─────────────┬──────────────┘
         │             │
    Oracle 21c        Redis 7
    (JPA + HikariCP)  (Balance Cache)
```

---

## 🔐 Security Notes

- All passwords hashed with BCrypt (strength=12)
- Phone & government ID encrypted with AES-256-GCM
- JWT access tokens expire in 15 minutes
- Accounts locked after 5 failed login attempts (30 min)
- Rate limiting: 100 requests/minute per IP

---

## 🧪 Running Tests

```bash
# Unit tests (no Oracle/Redis needed)
mvn test

# With coverage
mvn test jacoco:report
```

---

## 📁 Project Structure

```
src/
├── main/java/com/enterprise/wallet/
│   ├── config/          (Security, Redis, OpenAPI, Async)
│   ├── controller/      (Auth, Wallet, Transaction, Ledger)
│   ├── domain/
│   │   ├── entity/      (User, Wallet, Transaction, LedgerEntry, RefreshToken)
│   │   ├── enums/       (Currency, WalletStatus, TransactionType, ...)
│   │   └── repository/  (JPA Repositories)
│   ├── dto/             (Request/Response DTOs)
│   ├── encryption/      (AES-256-GCM service)
│   ├── exception/       (Custom exceptions + Global handler)
│   ├── security/        (JWT provider, filter, UserDetailsService)
│   └── service/         (Auth, Wallet, Transaction, Ledger, Cleanup)
└── resources/
    ├── application.yml
    ├── application-local.yml (H2 dev)
    ├── application-prod.yml  (Oracle)
    └── db/changelog/         (Liquibase migrations V001–V006)
```

---

## 📜 License

Proprietary — Enterprise Digital Wallet © 2024
