// ── Enums ─────────────────────────────────────────────────────
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'FROZEN';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'FEE' | 'REVERSAL';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED' | 'CANCELLED';

export type LedgerEntryType = 'DEBIT' | 'CREDIT';

// ── Response Wrappers ──────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ── Auth Models ────────────────────────────────────────────────
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
  issuedAt: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
}

// ── Wallet Models ──────────────────────────────────────────────
export interface CreateWalletRequest {
  walletName: string;
  currency: Currency;
  dailyLimit?: number;
}

export interface WalletResponse {
  id: string;
  walletAddress: string;
  walletName: string;
  currency: Currency;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  dailyLimit: number;
  dailySpent: number;
  status: WalletStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalanceResponse {
  walletId: string;
  balance: number;
}

// ── Transaction Models ─────────────────────────────────────────
export interface DepositRequest {
  walletId: string;
  amount: number;
  currency: Currency;
  description?: string;
  idempotencyKey?: string;
}

export interface WithdrawRequest {
  walletId: string;
  amount: number;
  currency: Currency;
  description?: string;
  idempotencyKey?: string;
}

export interface TransferRequest {
  sourceWalletId: string;
  targetWalletAddress: string;
  amount: number;
  currency: Currency;
  description?: string;
  idempotencyKey?: string;
}

export interface TransactionResponse {
  id: string;
  idempotencyKey: string;
  walletId: string;
  counterpartWalletId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  currency: Currency;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

// ── Ledger Models ───────────────────────────────────────────────
export interface LedgerEntryResponse {
  id: string;
  walletId: string;
  transactionId: string;
  entryType: LedgerEntryType;
  amount: number;
  currency: Currency;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}
