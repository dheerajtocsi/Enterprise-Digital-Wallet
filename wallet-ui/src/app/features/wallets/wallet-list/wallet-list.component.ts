import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { WalletService } from '../../../core/services/wallet.service';
import { ToastService } from '../../../core/services/toast.service';
import { WalletResponse, Currency } from '../../../models/models';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, ReactiveFormsModule],
  template: `
    <div class="page-header animate-in">
      <div class="page-title">
        <h1>My Wallets</h1>
        <p>Manage your digital wallets and balances</p>
      </div>
      <button class="btn btn-primary" (click)="showCreate.set(true)">+ New Wallet</button>
    </div>

    @if (loading()) {
      <div class="grid-3">
        @for (i of [1,2,3]; track i) {
          <div class="skeleton" style="height:200px"></div>
        }
      </div>
    } @else if (wallets().length === 0) {
      <div class="glass-card empty-state animate-in">
        <div class="empty-icon">👛</div>
        <h3>No wallets yet</h3>
        <p>Create your first wallet to start managing funds</p>
        <button class="btn btn-primary" (click)="showCreate.set(true)" style="margin-top:16px">Create Wallet</button>
      </div>
    } @else {
      <div class="grid-3 animate-in">
        @for (wallet of wallets(); track wallet.id; let i = $index) {
          <div class="wallet-card glass-card hoverable" [class]="'stagger-' + (i+1)">
            <!-- Header -->
            <div class="wc-header">
              <div class="currency-badge">{{ currencyEmoji(wallet.currency) }} {{ wallet.currency }}</div>
              <span class="badge" [class]="statusBadge(wallet.status)">{{ wallet.status }}</span>
            </div>

            <!-- Balance -->
            <div class="wc-balance">
              <div class="wc-balance-label">Available Balance</div>
              <div class="wc-balance-amount mono">
                {{ wallet.availableBalance | currency:wallet.currency:'symbol':'1.2-2' }}
              </div>
            </div>

            <!-- Details -->
            <div class="wc-details">
              <div class="wc-detail-row">
                <span>Wallet Name</span>
                <strong>{{ wallet.walletName }}</strong>
              </div>
              <div class="wc-detail-row">
                <span>Address</span>
                <code class="wc-address">{{ wallet.walletAddress }}</code>
              </div>
              <div class="wc-detail-row">
                <span>Daily Limit</span>
                <strong class="mono">{{ wallet.dailyLimit | currency:wallet.currency:'symbol':'1.0-0' }}</strong>
              </div>
              <div class="wc-detail-row">
                <span>Daily Spent</span>
                <strong class="mono">{{ wallet.dailySpent | currency:wallet.currency:'symbol':'1.0-0' }}</strong>
              </div>
            </div>

            <!-- Actions -->
            <div class="wc-actions">
              <a [routerLink]="['/wallets', wallet.id]" class="btn btn-ghost btn-sm flex-1">Details</a>
              <a routerLink="/transactions/deposit" [queryParams]="{walletId: wallet.id}" class="btn btn-success btn-sm">Deposit</a>
            </div>
          </div>
        }
      </div>
    }

    <!-- Create Wallet Modal -->
    @if (showCreate()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal animate-scale">
          <div class="modal-header">
            <div>
              <h2>Create New Wallet</h2>
              <p>Set up a new digital wallet</p>
            </div>
            <button class="modal-close" (click)="showCreate.set(false)">✕</button>
          </div>

          <form [formGroup]="createForm" (ngSubmit)="createWallet()" novalidate>
            <div class="form-group">
              <label class="form-label" for="wName">Wallet Name</label>
              <input id="wName" type="text" class="form-control"
                     formControlName="walletName" placeholder="e.g. Savings, Business" />
              @if (cf['walletName'].invalid && cf['walletName'].touched) {
                <span class="form-error">⚠ Wallet name is required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="wCurrency">Currency</label>
              <select id="wCurrency" class="form-select" formControlName="currency">
                @for (c of currencies; track c) {
                  <option [value]="c">{{ c }} {{ currencyEmoji(c) }}</option>
                }
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="wLimit">Daily Limit (optional)</label>
              <input id="wLimit" type="number" class="form-control"
                     formControlName="dailyLimit" placeholder="e.g. 100000" min="0" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="showCreate.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="creating()">
                @if (creating()) { <span class="spinner"></span> Creating... }
                @else { Create Wallet }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .wallet-card { display: flex; flex-direction: column; gap: 20px; }

    .wc-header { display: flex; align-items: center; justify-content: space-between; }

    .currency-badge {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px;
      background: rgba(92,110,248,0.12);
      border: 1px solid rgba(92,110,248,0.2);
      border-radius: 100px;
      font-size: 0.8rem; font-weight: 700;
      color: var(--accent-light);
    }

    .wc-balance { text-align: center; padding: 8px 0; }
    .wc-balance-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .wc-balance-amount { font-size: 1.8rem; font-weight: 800; background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    .wc-details { display: flex; flex-direction: column; gap: 8px; }
    .wc-detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; span { color: var(--text-muted); } strong { color: var(--text-primary); } }
    .wc-address { font-size: 0.68rem; color: var(--text-muted); font-family: monospace; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .wc-actions { display: flex; gap: 8px; }
  `]
})
export class WalletListComponent implements OnInit {
  private walletSvc = inject(WalletService);
  private toast     = inject(ToastService);
  private fb        = inject(FormBuilder);

  wallets    = signal<WalletResponse[]>([]);
  loading    = signal(true);
  showCreate = signal(false);
  creating   = signal(false);

  currencies: Currency[] = ['INR','USD','EUR','GBP','AED','SGD'];

  createForm = this.fb.group({
    walletName: ['', Validators.required],
    currency:   ['INR', Validators.required],
    dailyLimit: [null as number | null]
  });

  get cf() { return this.createForm.controls; }

  ngOnInit() { this.load(); }

  load() {
    this.walletSvc.getMyWallets().subscribe({
      next: res => { this.wallets.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  createWallet() {
    if (this.createForm.invalid) { this.createForm.markAllAsTouched(); return; }
    this.creating.set(true);
    const val = this.createForm.getRawValue() as any;
    if (!val.dailyLimit) delete val.dailyLimit;
    this.walletSvc.createWallet(val).subscribe({
      next: res => {
        this.wallets.update(w => [res.data, ...w]);
        this.showCreate.set(false);
        this.creating.set(false);
        this.createForm.reset({ currency: 'INR' });
        this.toast.success('Wallet Created', `${res.data.walletName} is ready to use.`);
      },
      error: () => this.creating.set(false)
    });
  }

  closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showCreate.set(false);
  }

  currencyEmoji(c: string): string {
    const map: Record<string,string> = { INR:'🇮🇳', USD:'🇺🇸', EUR:'🇪🇺', GBP:'🇬🇧', AED:'🇦🇪', SGD:'🇸🇬' };
    return map[c] ?? '💱';
  }
  statusBadge(s: string): string {
    const m: Record<string,string> = { ACTIVE:'badge badge-success', SUSPENDED:'badge badge-warning', CLOSED:'badge badge-muted', FROZEN:'badge badge-danger' };
    return m[s] ?? 'badge badge-muted';
  }
}
