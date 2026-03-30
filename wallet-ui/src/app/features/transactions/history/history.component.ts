import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TransactionService } from '../../../core/services/transaction.service';
import { WalletService } from '../../../core/services/wallet.service';
import { TransactionResponse, WalletResponse, PageResponse } from '../../../models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <div class="page-header animate-in">
      <div class="page-title">
        <h1>📋 Transaction History</h1>
        <p>Full paginated transaction log across your wallets</p>
      </div>
      <div class="flex gap-12">
        <a routerLink="/transactions/deposit" class="btn btn-success btn-sm">⬇️ Deposit</a>
        <a routerLink="/transactions/transfer" class="btn btn-primary btn-sm">🔄 Transfer</a>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card filters-card animate-in stagger-1" style="margin-bottom:20px">
      <div class="filters-row">
        <div class="form-group" style="margin:0;flex:1;min-width:200px">
          <label class="form-label" for="hWallet">Wallet</label>
          <select id="hWallet" class="form-select" [(ngModel)]="selectedWalletId" (change)="onWalletChange()" [ngModelOptions]="{standalone:true}">
            <option value="">All Wallets</option>
            @for (w of wallets(); track w.id) {
              <option [value]="w.id">{{ w.walletName }}</option>
            }
          </select>
        </div>
        <div class="form-group" style="margin:0;flex:none">
          <label class="form-label">Page Size</label>
          <select class="form-select" [(ngModel)]="pageSize" (change)="loadHistory(0)" [ngModelOptions]="{standalone:true}">
            <option [value]="10">10</option>
            <option [value]="20">20</option>
            <option [value]="50">50</option>
          </select>
        </div>
        <div style="flex:none;margin-top:20px">
          <button class="btn btn-ghost btn-sm" (click)="loadHistory(currentPage())">🔃 Refresh</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-card animate-in stagger-2">
      @if (!selectedWalletId) {
        <div class="empty-state">
          <div class="empty-icon">👛</div>
          <h3>Select a wallet</h3>
          <p>Choose a wallet above to view its transaction history</p>
        </div>
      } @else if (loading()) {
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="skeleton" style="height:52px;margin-bottom:8px;border-radius:10px"></div>
        }
      } @else if (txns().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No transactions found</h3>
          <p>Make your first deposit to get started</p>
        </div>
      } @else {
        <div class="table-meta">
          <span class="text-muted" style="font-size:0.8rem">
            Showing {{ txns().length }} of {{ page()?.totalElements ?? 0 }} transactions
          </span>
        </div>
        <div class="table-wrapper" style="margin-top:12px">
          <table class="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Fee</th>
                <th>Balance After</th>
                <th>Status</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              @for (t of txns(); track t.id) {
                <tr>
                  <td>
                    <span class="badge" [class]="txnTypeBadge(t.type)">{{ txnIcon(t.type) }} {{ t.type }}</span>
                  </td>
                  <td>
                    <span class="mono fw-bold" [class]="amountClass(t.type)">
                      {{ amountSign(t.type) }}{{ t.amount | currency:t.currency:'symbol':'1.2-2' }}
                    </span>
                  </td>
                  <td class="mono text-muted">{{ t.fee ? (t.fee | currency:t.currency:'symbol':'1.4-4') : '—' }}</td>
                  <td class="mono">{{ t.balanceAfter | currency:t.currency:'symbol':'1.2-2' }}</td>
                  <td><span class="badge" [class]="txnStatusBadge(t.status)">{{ t.status }}</span></td>
                  <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted)">{{ t.description || '—' }}</td>
                  <td class="text-muted" style="font-size:0.78rem">{{ t.createdAt | date:'dd MMM yy, HH:mm' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (page() && page()!.totalPages > 1) {
          <div class="pagination">
            <button class="page-btn" [disabled]="page()!.first" (click)="loadHistory(0)">«</button>
            <button class="page-btn" [disabled]="page()!.first" (click)="loadHistory(currentPage()-1)">‹</button>
            @for (p of pageNumbers(); track p) {
              <button class="page-btn" [class.active]="p === currentPage()" (click)="loadHistory(p)">{{ p+1 }}</button>
            }
            <button class="page-btn" [disabled]="page()!.last" (click)="loadHistory(currentPage()+1)">›</button>
            <button class="page-btn" [disabled]="page()!.last" (click)="loadHistory(page()!.totalPages-1)">»</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .filters-card { padding: 20px; }
    .filters-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }
    .fw-bold { font-weight: 700; }
    .table-meta { display: flex; align-items: center; justify-content: space-between; }
  `]
})
export class HistoryComponent implements OnInit {
  private txnSvc    = inject(TransactionService);
  private walletSvc = inject(WalletService);

  wallets       = signal<WalletResponse[]>([]);
  txns          = signal<TransactionResponse[]>([]);
  page          = signal<PageResponse<TransactionResponse> | null>(null);
  loading       = signal(false);
  currentPage   = signal(0);
  selectedWalletId = '';
  pageSize = 20;

  pageNumbers() {
    const total = this.page()?.totalPages ?? 0;
    const cur   = this.currentPage();
    const start = Math.max(0, cur - 2);
    const end   = Math.min(total, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  ngOnInit() {
    this.walletSvc.getMyWallets().subscribe({ next: res => this.wallets.set(res.data) });
  }

  onWalletChange() {
    if (this.selectedWalletId) this.loadHistory(0);
    else { this.txns.set([]); this.page.set(null); }
  }

  loadHistory(page: number) {
    if (!this.selectedWalletId) return;
    this.loading.set(true);
    this.currentPage.set(page);
    this.txnSvc.getHistory(this.selectedWalletId, page, this.pageSize).subscribe({
      next: res => { this.txns.set(res.data.content); this.page.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  txnTypeBadge(t: string){ const m: Record<string,string>={DEPOSIT:'badge badge-success',WITHDRAWAL:'badge badge-warning',TRANSFER_OUT:'badge badge-info',TRANSFER_IN:'badge badge-accent',FEE:'badge badge-muted',REVERSAL:'badge badge-danger'}; return m[t]??'badge badge-muted'; }
  txnStatusBadge(s: string){ const m: Record<string,string>={COMPLETED:'badge badge-success',PENDING:'badge badge-warning',FAILED:'badge badge-danger',REVERSED:'badge badge-info',CANCELLED:'badge badge-muted'}; return m[s]??'badge badge-muted'; }
  txnIcon(t: string){ const m: Record<string,string>={DEPOSIT:'⬇️',WITHDRAWAL:'⬆️',TRANSFER_OUT:'→',TRANSFER_IN:'←',FEE:'💸',REVERSAL:'↩️'}; return m[t]??''; }
  amountSign(t: string){ return ['DEPOSIT','TRANSFER_IN'].includes(t)?'+':'-'; }
  amountClass(t: string){ return ['DEPOSIT','TRANSFER_IN'].includes(t)?'text-success':'text-danger'; }
}
