import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { WalletService } from '../../core/services/wallet.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { WalletResponse, TransactionResponse } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-header animate-in">
      <div class="page-title">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{{ auth.currentUser()?.fullName ?? auth.currentUser()?.username }}</strong> 👋</p>
      </div>
      <div class="flex gap-12">
        <a routerLink="/wallets" class="btn btn-ghost btn-sm">View Wallets</a>
        <a routerLink="/transactions/deposit" class="btn btn-primary btn-sm">+ Deposit</a>
      </div>
    </div>

    <!-- Stats Row -->
    @if (loading()) {
      <div class="grid-4" style="margin-bottom:28px">
        @for (i of [1,2,3,4]; track i) {
          <div class="skeleton" style="height:120px"></div>
        }
      </div>
    } @else {
      <div class="grid-4 animate-in" style="margin-bottom:28px">
        <div class="stat-card glass-card stagger-1">
          <div class="stat-label">Total Wallets</div>
          <div class="stat-value">{{ wallets().length }}</div>
          <div class="stat-icon">👛</div>
        </div>
        <div class="stat-card glass-card stagger-2">
          <div class="stat-label">Total Balance</div>
          <div class="stat-value mono">{{ totalBalance() | currency:'INR':'symbol':'1.2-2' }}</div>
          <div class="stat-icon">💰</div>
        </div>
        <div class="stat-card glass-card stagger-3">
          <div class="stat-label">Active Wallets</div>
          <div class="stat-value">{{ activeWallets() }}</div>
          <div class="stat-icon">✅</div>
        </div>
        <div class="stat-card glass-card stagger-4">
          <div class="stat-label">Recent Transactions</div>
          <div class="stat-value">{{ recentTxns().length }}</div>
          <div class="stat-icon">📊</div>
        </div>
      </div>
    }

    <div class="dashboard-grid">
      <!-- Wallets Section -->
      <div class="glass-card animate-in stagger-2">
        <div class="section-header">
          <h3>My Wallets</h3>
          <a routerLink="/wallets" class="btn btn-ghost btn-sm">View all →</a>
        </div>

        @if (loading()) {
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:64px;margin-bottom:10px;border-radius:12px"></div>
          }
        } @else if (wallets().length === 0) {
          <div class="empty-state" style="padding:32px 0">
            <div class="empty-icon">👛</div>
            <h3>No wallets yet</h3>
            <a routerLink="/wallets" class="btn btn-primary btn-sm" style="margin-top:12px">Create Wallet</a>
          </div>
        } @else {
          <div class="wallet-list">
            @for (wallet of wallets().slice(0, 4); track wallet.id) {
              <a [routerLink]="['/wallets', wallet.id]" class="wallet-row">
                <div class="wallet-icon">{{ currencyEmoji(wallet.currency) }}</div>
                <div class="wallet-info">
                  <span class="wallet-name">{{ wallet.walletName }}</span>
                  <span class="wallet-address">{{ wallet.walletAddress }}</span>
                </div>
                <div class="wallet-right">
                  <span class="wallet-balance mono">{{ wallet.balance | currency:wallet.currency:'symbol':'1.2-2' }}</span>
                  <span class="badge" [class]="statusBadge(wallet.status)">{{ wallet.status }}</span>
                </div>
              </a>
            }
          </div>
        }
      </div>

      <!-- Quick Actions -->
      <div class="glass-card animate-in stagger-3">
        <h3 style="margin-bottom:20px">Quick Actions</h3>
        <div class="actions-grid">
          <a routerLink="/transactions/deposit" class="action-card">
            <span class="action-icon deposit">⬇️</span>
            <span>Deposit</span>
          </a>
          <a routerLink="/transactions/withdraw" class="action-card">
            <span class="action-icon withdraw">⬆️</span>
            <span>Withdraw</span>
          </a>
          <a routerLink="/transactions/transfer" class="action-card">
            <span class="action-icon transfer">🔄</span>
            <span>Transfer</span>
          </a>
          <a routerLink="/transactions/history" class="action-card">
            <span class="action-icon history">📋</span>
            <span>History</span>
          </a>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="glass-card animate-in stagger-4" style="grid-column: 1 / -1">
        <div class="section-header">
          <h3>Recent Transactions</h3>
          <a routerLink="/transactions/history" class="btn btn-ghost btn-sm">View all →</a>
        </div>

        @if (loadingTxns()) {
          @for (i of [1,2,3,4,5]; track i) {
            <div class="skeleton" style="height:52px;margin-bottom:8px;border-radius:10px"></div>
          }
        } @else if (recentTxns().length === 0) {
          <div class="empty-state" style="padding:32px 0">
            <div class="empty-icon">📋</div>
            <h3>No transactions yet</h3>
            <p>Make your first deposit to get started</p>
          </div>
        } @else {
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (txn of recentTxns(); track txn.id) {
                  <tr>
                    <td>
                      <span class="badge" [class]="txnTypeBadge(txn.type)">
                        {{ txnTypeIcon(txn.type) }} {{ txn.type }}
                      </span>
                    </td>
                    <td>
                      <span class="mono" [class]="txnAmountClass(txn.type)">
                        {{ txnAmountSign(txn.type) }}{{ txn.amount | currency:txn.currency:'symbol':'1.2-2' }}
                      </span>
                    </td>
                    <td><span class="badge" [class]="txnStatusBadge(txn.status)">{{ txn.status }}</span></td>
                    <td style="color:var(--text-muted)">{{ txn.description || '—' }}</td>
                    <td style="color:var(--text-muted)">{{ txn.createdAt | date:'dd MMM, HH:mm' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
    }
    @media(max-width:900px) { .dashboard-grid { grid-template-columns: 1fr; } }

    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; h3 { margin: 0; } }

    /* Stat Cards */
    .stat-card {
      position: relative;
      overflow: hidden;
      padding: 22px;
      &::before {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 80px; height: 80px;
        background: var(--gradient-accent);
        opacity: 0.06;
        border-radius: 0 0 0 80px;
      }
    }
    .stat-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .stat-value { font-size: 1.6rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .stat-icon  { position: absolute; top: 18px; right: 18px; font-size: 1.8rem; opacity: 0.6; }

    /* Wallet List */
    .wallet-list { display: flex; flex-direction: column; gap: 6px; }
    .wallet-row {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 14px; border-radius: var(--radius-md);
      border: 1px solid transparent;
      text-decoration: none;
      transition: all var(--transition);
      &:hover { background: var(--bg-card-hover); border-color: var(--border); }
    }
    .wallet-icon  { font-size: 1.4rem; flex-shrink: 0; }
    .wallet-info  { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .wallet-name  { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wallet-address { font-size: 0.72rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .wallet-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
    .wallet-balance { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }

    /* Quick Actions */
    .actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .action-card {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 20px 16px; border-radius: var(--radius-md);
      background: var(--bg-input); border: 1px solid var(--border);
      text-decoration: none; color: var(--text-secondary);
      font-size: 0.83rem; font-weight: 600;
      transition: all var(--transition);
      &:hover { background: var(--bg-card-hover); border-color: rgba(92,110,248,0.3); color: var(--text-primary); transform: translateY(-2px); }
    }
    .action-icon { font-size: 1.8rem; }
  `]
})
export class DashboardComponent implements OnInit {
  auth           = inject(AuthService);
  private walletSvc = inject(WalletService);
  private txnSvc    = inject(TransactionService);

  wallets     = signal<WalletResponse[]>([]);
  recentTxns  = signal<TransactionResponse[]>([]);
  loading     = signal(true);
  loadingTxns = signal(true);

  totalBalance  = () => this.wallets().reduce((sum, w) => sum + w.balance, 0);
  activeWallets = () => this.wallets().filter(w => w.status === 'ACTIVE').length;

  ngOnInit() {
    this.walletSvc.getMyWallets().subscribe({
      next: res => {
        this.wallets.set(res.data);
        this.loading.set(false);
        // Load recent txns from first wallet
        if (res.data.length > 0) {
          this.loadRecentTxns(res.data[0].id);
        } else {
          this.loadingTxns.set(false);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  private loadRecentTxns(walletId: string) {
    this.txnSvc.getHistory(walletId, 0, 5).subscribe({
      next: res => { this.recentTxns.set(res.data.content); this.loadingTxns.set(false); },
      error: () => this.loadingTxns.set(false)
    });
  }

  currencyEmoji(c: string): string {
    const map: Record<string,string> = { INR:'🇮🇳', USD:'🇺🇸', EUR:'🇪🇺', GBP:'🇬🇧', AED:'🇦🇪', SGD:'🇸🇬' };
    return map[c] ?? '💱';
  }
  statusBadge(s: string): string {
    const map: Record<string,string> = { ACTIVE:'badge-success', SUSPENDED:'badge-warning', CLOSED:'badge-muted', FROZEN:'badge-danger' };
    return 'badge ' + (map[s] ?? 'badge-muted');
  }
  txnTypeBadge(t: string): string {
    const map: Record<string,string> = { DEPOSIT:'badge-success', WITHDRAWAL:'badge-warning', TRANSFER_OUT:'badge-info', TRANSFER_IN:'badge-accent', FEE:'badge-muted', REVERSAL:'badge-danger' };
    return 'badge ' + (map[t] ?? 'badge-muted');
  }
  txnStatusBadge(s: string): string {
    const map: Record<string,string> = { COMPLETED:'badge-success', PENDING:'badge-warning', FAILED:'badge-danger', REVERSED:'badge-info', CANCELLED:'badge-muted' };
    return 'badge ' + (map[s] ?? 'badge-muted');
  }
  txnTypeIcon(t: string): string {
    const map: Record<string,string> = { DEPOSIT:'⬇️', WITHDRAWAL:'⬆️', TRANSFER_OUT:'→', TRANSFER_IN:'←', FEE:'💸', REVERSAL:'↩️' };
    return map[t] ?? '';
  }
  txnAmountSign(t: string): string {
    return ['DEPOSIT','TRANSFER_IN'].includes(t) ? '+' : '-';
  }
  txnAmountClass(t: string): string {
    return ['DEPOSIT','TRANSFER_IN'].includes(t) ? 'text-success' : 'text-danger';
  }
}
