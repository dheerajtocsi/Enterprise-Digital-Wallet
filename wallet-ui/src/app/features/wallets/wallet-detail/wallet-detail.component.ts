import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { WalletService } from '../../../core/services/wallet.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { LedgerService } from '../../../core/services/ledger.service';
import { WalletResponse, TransactionResponse, LedgerEntryResponse, PageResponse } from '../../../models/models';

@Component({
  selector: 'app-wallet-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="animate-in">
      <!-- Back -->
      <a routerLink="/wallets" class="btn btn-ghost btn-sm" style="margin-bottom:20px">← Back to Wallets</a>

      @if (loading()) {
        <div class="skeleton" style="height:200px;margin-bottom:24px"></div>
      } @else if (wallet()) {
        <!-- Wallet Hero Card -->
        <div class="glass-card wallet-hero animate-in" style="margin-bottom:24px">
          <div class="wh-left">
            <div class="currency-big">{{ currencyEmoji(wallet()!.currency) }}</div>
            <div>
              <h1 style="font-size:1.5rem;margin-bottom:4px">{{ wallet()!.walletName }}</h1>
              <code style="font-size:0.78rem;color:var(--text-muted)">{{ wallet()!.walletAddress }}</code>
            </div>
          </div>
          <span class="badge" [class]="statusBadge(wallet()!.status)">{{ wallet()!.status }}</span>
        </div>

        <!-- Stats Row -->
        <div class="grid-4 animate-in stagger-1" style="margin-bottom:24px">
          <div class="glass-card stat-mini">
            <div class="sm-label">Total Balance</div>
            <div class="sm-value mono">{{ balance() ?? wallet()!.balance | currency:wallet()!.currency:'symbol':'1.2-2' }}</div>
          </div>
          <div class="glass-card stat-mini">
            <div class="sm-label">Available</div>
            <div class="sm-value mono text-success">{{ wallet()!.availableBalance | currency:wallet()!.currency:'symbol':'1.2-2' }}</div>
          </div>
          <div class="glass-card stat-mini">
            <div class="sm-label">Locked</div>
            <div class="sm-value mono text-warning">{{ wallet()!.lockedBalance | currency:wallet()!.currency:'symbol':'1.2-2' }}</div>
          </div>
          <div class="glass-card stat-mini">
            <div class="sm-label">Daily Spent</div>
            <div class="sm-value mono">{{ wallet()!.dailySpent | currency:wallet()!.currency:'symbol':'1.2-2' }}</div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex gap-12 animate-in stagger-2" style="margin-bottom:28px;flex-wrap:wrap">
          <a routerLink="/transactions/deposit" [queryParams]="{walletId: wallet()!.id}" class="btn btn-success">⬇️ Deposit</a>
          <a routerLink="/transactions/withdraw" [queryParams]="{walletId: wallet()!.id}" class="btn btn-ghost">⬆️ Withdraw</a>
          <a routerLink="/transactions/transfer" [queryParams]="{walletId: wallet()!.id}" class="btn btn-ghost">🔄 Transfer</a>
          <button class="btn btn-ghost" (click)="refreshBalance()">🔃 Refresh Balance</button>
        </div>

        <!-- Tabs -->
        <div class="tabs animate-in stagger-3">
          <button class="tab-btn" [class.active]="activeTab() === 'transactions'" (click)="activeTab.set('transactions')">Transactions</button>
          <button class="tab-btn" [class.active]="activeTab() === 'ledger'" (click)="switchToLedger()">Ledger Entries</button>
        </div>

        <!-- Transactions Tab -->
        @if (activeTab() === 'transactions') {
          <div class="glass-card animate-in">
            @if (loadingTxns()) {
              @for (i of [1,2,3,4]; track i) {
                <div class="skeleton" style="height:50px;margin-bottom:8px;border-radius:10px"></div>
              }
            } @else if (txns().length === 0) {
              <div class="empty-state"><div class="empty-icon">📋</div><h3>No transactions</h3></div>
            } @else {
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr><th>Type</th><th>Amount</th><th>Fee</th><th>Status</th><th>Description</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    @for (t of txns(); track t.id) {
                      <tr>
                        <td><span class="badge" [class]="txnTypeBadge(t.type)">{{ t.type }}</span></td>
                        <td><span class="mono" [class]="amountClass(t.type)">{{ amountSign(t.type) }}{{ t.amount | currency:t.currency:'symbol':'1.2-2' }}</span></td>
                        <td><span class="mono text-muted">{{ t.fee ? (t.fee | currency:t.currency:'symbol':'1.2-2') : '—' }}</span></td>
                        <td><span class="badge" [class]="txnStatusBadge(t.status)">{{ t.status }}</span></td>
                        <td style="color:var(--text-muted)">{{ t.description || '—' }}</td>
                        <td style="color:var(--text-muted)">{{ t.createdAt | date:'dd MMM yy, HH:mm' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              @if (txnPage()) {
                <div class="pagination">
                  <button class="page-btn" [disabled]="txnPage()!.first" (click)="loadTxns(currentTxnPage()-1)">‹</button>
                  <span class="page-info">{{ currentTxnPage()+1 }} / {{ txnPage()!.totalPages }}</span>
                  <button class="page-btn" [disabled]="txnPage()!.last" (click)="loadTxns(currentTxnPage()+1)">›</button>
                </div>
              }
            }
          </div>
        }

        <!-- Ledger Tab -->
        @if (activeTab() === 'ledger') {
          <div class="glass-card animate-in">
            @if (loadingLedger()) {
              @for (i of [1,2,3,4]; track i) {
                <div class="skeleton" style="height:50px;margin-bottom:8px;border-radius:10px"></div>
              }
            } @else if (ledger().length === 0) {
              <div class="empty-state"><div class="empty-icon">📒</div><h3>No ledger entries</h3></div>
            } @else {
              <div class="table-wrapper">
                <table class="data-table">
                  <thead>
                    <tr><th>Type</th><th>Amount</th><th>Balance Before</th><th>Balance After</th><th>Description</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    @for (e of ledger(); track e.id) {
                      <tr>
                        <td><span class="badge" [class]="e.entryType==='CREDIT' ? 'badge badge-success' : 'badge badge-danger'">{{ e.entryType }}</span></td>
                        <td><span class="mono" [class]="e.entryType==='CREDIT' ? 'text-success' : 'text-danger'">{{ e.entryType==='CREDIT' ? '+' : '-' }}{{ e.amount | currency:e.currency:'symbol':'1.2-2' }}</span></td>
                        <td class="mono text-muted">{{ e.balanceBefore | currency:e.currency:'symbol':'1.2-2' }}</td>
                        <td class="mono">{{ e.balanceAfter | currency:e.currency:'symbol':'1.2-2' }}</td>
                        <td style="color:var(--text-muted)">{{ e.description || '—' }}</td>
                        <td style="color:var(--text-muted)">{{ e.createdAt | date:'dd MMM yy, HH:mm' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              @if (ledgerPage()) {
                <div class="pagination">
                  <button class="page-btn" [disabled]="ledgerPage()!.first" (click)="loadLedger(currentLedgerPage()-1)">‹</button>
                  <span class="page-info">{{ currentLedgerPage()+1 }} / {{ ledgerPage()!.totalPages }}</span>
                  <button class="page-btn" [disabled]="ledgerPage()!.last" (click)="loadLedger(currentLedgerPage()+1)">›</button>
                </div>
              }
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .wallet-hero { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .wh-left { display: flex; align-items: center; gap: 18px; }
    .currency-big { font-size: 2.8rem; }

    .stat-mini { padding: 18px 20px; }
    .sm-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .sm-value { font-size: 1.2rem; font-weight: 800; }

    .tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
    .tab-btn {
      padding: 10px 20px;
      background: transparent; border: none;
      color: var(--text-muted); font-size: 0.875rem; font-weight: 600;
      cursor: pointer; position: relative;
      transition: color var(--transition);
      &:hover { color: var(--text-secondary); }
      &.active {
        color: var(--accent-light);
        &::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--accent); }
      }
    }
  `]
})
export class WalletDetailComponent implements OnInit {
  private route     = inject(ActivatedRoute);
  private walletSvc = inject(WalletService);
  private txnSvc    = inject(TransactionService);
  private ledgerSvc = inject(LedgerService);

  wallet    = signal<WalletResponse | null>(null);
  balance   = signal<number | null>(null);
  txns      = signal<TransactionResponse[]>([]);
  ledger    = signal<LedgerEntryResponse[]>([]);
  txnPage   = signal<PageResponse<TransactionResponse> | null>(null);
  ledgerPage= signal<PageResponse<LedgerEntryResponse> | null>(null);

  loading       = signal(true);
  loadingTxns   = signal(false);
  loadingLedger = signal(false);
  activeTab     = signal<'transactions'|'ledger'>('transactions');
  currentTxnPage   = signal(0);
  currentLedgerPage= signal(0);

  private walletId = '';

  ngOnInit() {
    this.walletId = this.route.snapshot.paramMap.get('id') ?? '';
    this.walletSvc.getWalletById(this.walletId).subscribe({
      next: res => { this.wallet.set(res.data); this.loading.set(false); this.loadTxns(0); },
      error: () => this.loading.set(false)
    });
  }

  refreshBalance() {
    this.walletSvc.getBalance(this.walletId).subscribe({
      next: res => this.balance.set(res.data.balance)
    });
  }

  loadTxns(page: number) {
    this.loadingTxns.set(true);
    this.currentTxnPage.set(page);
    this.txnSvc.getHistory(this.walletId, page, 10).subscribe({
      next: res => { this.txns.set(res.data.content); this.txnPage.set(res.data); this.loadingTxns.set(false); },
      error: () => this.loadingTxns.set(false)
    });
  }

  switchToLedger() {
    this.activeTab.set('ledger');
    if (this.ledger().length === 0) this.loadLedger(0);
  }

  loadLedger(page: number) {
    this.loadingLedger.set(true);
    this.currentLedgerPage.set(page);
    this.ledgerSvc.getLedger(this.walletId, page, 10).subscribe({
      next: res => { this.ledger.set(res.data.content); this.ledgerPage.set(res.data); this.loadingLedger.set(false); },
      error: () => this.loadingLedger.set(false)
    });
  }

  currencyEmoji(c: string) { const m: Record<string,string> = {INR:'🇮🇳',USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',AED:'🇦🇪',SGD:'🇸🇬'}; return m[c]??'💱'; }
  statusBadge(s: string)   { const m: Record<string,string> = {ACTIVE:'badge badge-success',SUSPENDED:'badge badge-warning',CLOSED:'badge badge-muted',FROZEN:'badge badge-danger'}; return m[s]??'badge badge-muted'; }
  txnTypeBadge(t: string)  { const m: Record<string,string> = {DEPOSIT:'badge badge-success',WITHDRAWAL:'badge badge-warning',TRANSFER_OUT:'badge badge-info',TRANSFER_IN:'badge badge-accent',FEE:'badge badge-muted',REVERSAL:'badge badge-danger'}; return m[t]??'badge badge-muted'; }
  txnStatusBadge(s: string){ const m: Record<string,string> = {COMPLETED:'badge badge-success',PENDING:'badge badge-warning',FAILED:'badge badge-danger',REVERSED:'badge badge-info',CANCELLED:'badge badge-muted'}; return m[s]??'badge badge-muted'; }
  amountSign(t: string)    { return ['DEPOSIT','TRANSFER_IN'].includes(t) ? '+' : '-'; }
  amountClass(t: string)   { return ['DEPOSIT','TRANSFER_IN'].includes(t) ? 'text-success' : 'text-danger'; }
}
