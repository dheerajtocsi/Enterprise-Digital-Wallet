import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LedgerService } from '../../core/services/ledger.service';
import { WalletService } from '../../core/services/wallet.service';
import { LedgerEntryResponse, WalletResponse, PageResponse } from '../../models/models';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-header animate-in">
      <div class="page-title">
        <h1>📒 Ledger Entries</h1>
        <p>Double-entry bookkeeping records for this wallet</p>
      </div>
      <a routerLink="/wallets" class="btn btn-ghost btn-sm">← Back to Wallets</a>
    </div>

    @if (wallet()) {
      <div class="glass-card wallet-banner animate-in stagger-1" style="margin-bottom:20px">
        <span class="currency-chip">{{ currencyEmoji(wallet()!.currency) }} {{ wallet()!.currency }}</span>
        <div>
          <strong>{{ wallet()!.walletName }}</strong>
          <span class="text-muted" style="font-size:0.78rem;margin-left:12px">{{ wallet()!.walletAddress }}</span>
        </div>
        <div class="flex gap-8" style="margin-left:auto">
          <span class="badge badge-success">Balance: {{ wallet()!.balance | currency:wallet()!.currency:'symbol':'1.2-2' }}</span>
        </div>
      </div>
    }

    <div class="glass-card animate-in stagger-2">
      @if (loading()) {
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="skeleton" style="height:52px;margin-bottom:8px;border-radius:10px"></div>
        }
      } @else if (entries().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📒</div>
          <h3>No ledger entries</h3>
          <p>This wallet has no bookkeeping records yet</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Entry Type</th>
                <th>Amount</th>
                <th>Balance Before</th>
                <th>Balance After</th>
                <th>Transaction ID</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (e of entries(); track e.id) {
                <tr>
                  <td>
                    <span class="entry-type" [class]="e.entryType === 'CREDIT' ? 'credit' : 'debit'">
                      {{ e.entryType === 'CREDIT' ? '↑ CREDIT' : '↓ DEBIT' }}
                    </span>
                  </td>
                  <td>
                    <span class="mono fw" [class]="e.entryType === 'CREDIT' ? 'text-success' : 'text-danger'">
                      {{ e.entryType === 'CREDIT' ? '+' : '-' }}{{ e.amount | currency:e.currency:'symbol':'1.2-2' }}
                    </span>
                  </td>
                  <td class="mono text-muted">{{ e.balanceBefore | currency:e.currency:'symbol':'1.2-2' }}</td>
                  <td class="mono">{{ e.balanceAfter | currency:e.currency:'symbol':'1.2-2' }}</td>
                  <td>
                    <code class="txn-id">{{ e.transactionId.slice(0,8) }}...</code>
                  </td>
                  <td class="text-muted" style="font-size:0.82rem">{{ e.description || '—' }}</td>
                  <td class="text-muted" style="font-size:0.78rem">{{ e.createdAt | date:'dd MMM yy, HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (page() && page()!.totalPages > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="page()!.first" (click)="loadLedger(currentPage()-1)">‹</button>
            <span class="page-info">Page {{ currentPage()+1 }} of {{ page()!.totalPages }}</span>
            <button class="page-btn" [disabled]="page()!.last" (click)="loadLedger(currentPage()+1)">›</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .wallet-banner { display: flex; align-items: center; gap: 16px; padding: 18px 24px; flex-wrap: wrap; }
    .currency-chip { background: rgba(92,110,248,0.12); border: 1px solid rgba(92,110,248,0.2); border-radius: 100px; padding: 4px 12px; font-size: 0.82rem; font-weight: 700; color: var(--accent-light); }

    .entry-type {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 100px;
      font-size: 0.72rem; font-weight: 700;
      &.credit { background: var(--success-dim); color: var(--success); }
      &.debit  { background: var(--danger-dim);  color: var(--danger); }
    }
    .txn-id { font-size: 0.72rem; background: var(--bg-input); padding: 2px 8px; border-radius: 4px; color: var(--text-muted); }
    .fw { font-weight: 700; }
  `]
})
export class LedgerComponent implements OnInit {
  private route     = inject(ActivatedRoute);
  private ledgerSvc = inject(LedgerService);
  private walletSvc = inject(WalletService);

  wallet      = signal<WalletResponse | null>(null);
  entries     = signal<LedgerEntryResponse[]>([]);
  page        = signal<PageResponse<LedgerEntryResponse> | null>(null);
  loading     = signal(true);
  currentPage = signal(0);

  private walletId = '';

  ngOnInit() {
    this.walletId = this.route.snapshot.paramMap.get('walletId') ?? '';
    this.walletSvc.getWalletById(this.walletId).subscribe({ next: res => this.wallet.set(res.data) });
    this.loadLedger(0);
  }

  loadLedger(page: number) {
    this.loading.set(true);
    this.currentPage.set(page);
    this.ledgerSvc.getLedger(this.walletId, page, 20).subscribe({
      next: res => { this.entries.set(res.data.content); this.page.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  currencyEmoji(c: string): string {
    const m: Record<string,string> = {INR:'🇮🇳',USD:'🇺🇸',EUR:'🇪🇺',GBP:'🇬🇧',AED:'🇦🇪',SGD:'🇸🇬'};
    return m[c] ?? '💱';
  }
}
