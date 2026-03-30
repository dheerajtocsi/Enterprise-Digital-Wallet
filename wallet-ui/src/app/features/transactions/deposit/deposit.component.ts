import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TransactionService } from '../../../core/services/transaction.service';
import { WalletService } from '../../../core/services/wallet.service';
import { ToastService } from '../../../core/services/toast.service';
import { WalletResponse, Currency } from '../../../models/models';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page-header animate-in">
      <div class="page-title">
        <h1>💰 Deposit Funds</h1>
        <p>Add money to your wallet</p>
      </div>
      <a routerLink="/transactions/history" class="btn btn-ghost btn-sm">View History →</a>
    </div>

    <div class="txn-layout">
      <div class="glass-card animate-in stagger-1">
        <h3 style="margin-bottom:24px">Deposit Details</h3>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="walletId">Select Wallet</label>
            <select id="walletId" class="form-select" formControlName="walletId">
              <option value="" disabled>Choose a wallet...</option>
              @for (w of wallets(); track w.id) {
                <option [value]="w.id">{{ w.walletName }} — {{ w.availableBalance | currency:w.currency:'symbol':'1.2-2' }}</option>
              }
            </select>
            @if (f['walletId'].invalid && f['walletId'].touched) {
              <span class="form-error">⚠ Please select a wallet</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="amount">Amount</label>
            <div class="input-group">
              <span class="input-prefix">{{ selectedCurrencySymbol() }}</span>
              <input id="amount" type="number" class="form-control has-prefix"
                     formControlName="amount" placeholder="0.00" min="0.01" step="0.01" />
            </div>
            @if (f['amount'].invalid && f['amount'].touched) {
              <span class="form-error">⚠ Amount must be greater than 0</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="depCurrency">Currency</label>
            <select id="depCurrency" class="form-select" formControlName="currency">
              @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="depDesc">Description (optional)</label>
            <input id="depDesc" type="text" class="form-control"
                   formControlName="description" placeholder="e.g. Salary for March" />
          </div>

          <div class="form-group">
            <label class="form-label" for="depKey">Idempotency Key (optional)</label>
            <div class="input-group">
              <input id="depKey" type="text" class="form-control has-suffix"
                     formControlName="idempotencyKey" placeholder="Auto-generated if empty" />
              <button type="button" class="input-suffix" style="background:transparent;border:none;cursor:pointer;color:var(--accent-light);font-size:0.75rem;font-weight:600"
                      (click)="genKey()">Generate</button>
            </div>
          </div>

          <button type="submit" class="btn btn-success btn-block btn-lg" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Processing... }
            @else { ⬇️ Deposit Funds }
          </button>
        </form>
      </div>

      <!-- Info Panel -->
      <div class="glass-card info-panel animate-in stagger-2">
        <h4 style="margin-bottom:16px">ℹ️ About Deposits</h4>
        <div class="info-list">
          <div class="info-item"><span class="info-dot success"></span><span>Funds are credited instantly</span></div>
          <div class="info-item"><span class="info-dot success"></span><span>No deposit fees</span></div>
          <div class="info-item"><span class="info-dot info"></span><span>Idempotency keys prevent duplicate deposits</span></div>
          <div class="info-item"><span class="info-dot info"></span><span>All transactions are logged in the ledger</span></div>
        </div>

        @if (selectedWallet()) {
          <div class="wallet-preview" style="margin-top:24px">
            <h4 style="margin-bottom:12px">Selected Wallet</h4>
            <div class="wp-row"><span>Name</span><strong>{{ selectedWallet()!.walletName }}</strong></div>
            <div class="wp-row"><span>Available</span><strong class="text-success mono">{{ selectedWallet()!.availableBalance | currency:selectedWallet()!.currency:'symbol':'1.2-2' }}</strong></div>
            <div class="wp-row"><span>Status</span><span class="badge" [class]="statusBadge(selectedWallet()!.status)">{{ selectedWallet()!.status }}</span></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .txn-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    @media(max-width:900px) { .txn-layout { grid-template-columns: 1fr; } }
    .info-panel h4 { font-size: 0.95rem; }
    .info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: var(--text-secondary); }
    .info-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; &.success{background:var(--success);} &.info{background:var(--info);} }
    .wallet-preview { background: var(--bg-input); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--border); }
    .wp-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.83rem; margin-bottom: 8px; span { color: var(--text-muted); } strong { color: var(--text-primary); } &:last-child { margin-bottom: 0; } }
  `]
})
export class DepositComponent implements OnInit {
  private fb        = inject(FormBuilder);
  private txnSvc    = inject(TransactionService);
  private walletSvc = inject(WalletService);
  private toast     = inject(ToastService);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);

  wallets  = signal<WalletResponse[]>([]);
  loading  = signal(false);
  currencies: Currency[] = ['INR','USD','EUR','GBP','AED','SGD'];

  form = this.fb.group({
    walletId:       ['', Validators.required],
    amount:         [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency:       ['INR', Validators.required],
    description:    [''],
    idempotencyKey: ['']
  });

  get f() { return this.form.controls; }

  selectedWallet = () => this.wallets().find(w => w.id === this.form.get('walletId')?.value);
  selectedCurrencySymbol = () => {
    const symbols: Record<string,string> = {INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',SGD:'S$'};
    return symbols[this.form.get('currency')?.value as string] ?? '$';
  };
  statusBadge(s: string) { const m: Record<string,string> = {ACTIVE:'badge badge-success',SUSPENDED:'badge badge-warning',CLOSED:'badge badge-muted',FROZEN:'badge badge-danger'}; return m[s]??'badge badge-muted'; }

  ngOnInit() {
    this.walletSvc.getMyWallets().subscribe({ next: res => this.wallets.set(res.data) });
    const wId = this.route.snapshot.queryParamMap.get('walletId');
    if (wId) this.form.patchValue({ walletId: wId });
  }

  genKey() { this.form.patchValue({ idempotencyKey: crypto.randomUUID() }); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const val = this.form.getRawValue() as any;
    if (!val.idempotencyKey) val.idempotencyKey = crypto.randomUUID();
    this.txnSvc.deposit(val).subscribe({
      next: res => {
        this.loading.set(false);
        this.toast.success('Deposit Successful', `₹${res.data.amount} deposited successfully.`);
        this.router.navigate(['/wallets', val.walletId]);
      },
      error: () => this.loading.set(false)
    });
  }
}
