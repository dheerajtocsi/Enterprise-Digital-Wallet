import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TransactionService } from '../../../core/services/transaction.service';
import { WalletService } from '../../../core/services/wallet.service';
import { ToastService } from '../../../core/services/toast.service';
import { WalletResponse, Currency } from '../../../models/models';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page-header animate-in">
      <div class="page-title">
        <h1>🔄 Transfer Funds</h1>
        <p>Send money to another wallet (P2P)</p>
      </div>
      <a routerLink="/transactions/history" class="btn btn-ghost btn-sm">View History →</a>
    </div>

    <div class="txn-layout">
      <div class="glass-card animate-in stagger-1">
        <h3 style="margin-bottom:24px">Transfer Details</h3>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="form-group">
            <label class="form-label" for="srcWallet">From Wallet</label>
            <select id="srcWallet" class="form-select" formControlName="sourceWalletId">
              <option value="" disabled>Choose source wallet...</option>
              @for (w of wallets(); track w.id) {
                <option [value]="w.id">{{ w.walletName }} — {{ w.availableBalance | currency:w.currency:'symbol':'1.2-2' }}</option>
              }
            </select>
            @if (f['sourceWalletId'].invalid && f['sourceWalletId'].touched) {
              <span class="form-error">⚠ Please select source wallet</span>
            }
          </div>

          <!-- Transfer Arrow -->
          <div class="transfer-arrow">
            <div class="ta-line"></div>
            <div class="ta-icon">↓</div>
            <div class="ta-line"></div>
          </div>

          <div class="form-group">
            <label class="form-label" for="targetAddr">To Wallet Address</label>
            <input id="targetAddr" type="text" class="form-control"
                   formControlName="targetWalletAddress"
                   placeholder="Enter recipient wallet address..." />
            @if (f['targetWalletAddress'].invalid && f['targetWalletAddress'].touched) {
              <span class="form-error">⚠ Target wallet address is required</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="tAmount">Amount</label>
            <div class="input-group">
              <span class="input-prefix">{{ currencySymbol() }}</span>
              <input id="tAmount" type="number" class="form-control has-prefix"
                     formControlName="amount" placeholder="0.00" min="0.01" step="0.01" />
            </div>
            @if (f['amount'].invalid && f['amount'].touched) {
              <span class="form-error">⚠ Amount must be greater than 0</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label" for="tCurrency">Currency</label>
            <select id="tCurrency" class="form-select" formControlName="currency">
              @for (c of currencies; track c) { <option [value]="c">{{ c }}</option> }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="tDesc">Description (optional)</label>
            <input id="tDesc" type="text" class="form-control"
                   formControlName="description" placeholder="e.g. Rent payment" />
          </div>

          <div class="form-group">
            <label class="form-label" for="tKey">Idempotency Key (optional)</label>
            <div class="input-group">
              <input id="tKey" type="text" class="form-control has-suffix"
                     formControlName="idempotencyKey" placeholder="Auto-generated" />
              <button type="button" class="input-suffix" style="background:transparent;border:none;cursor:pointer;color:var(--accent-light);font-size:0.75rem;font-weight:600"
                      (click)="genKey()">Generate</button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> Processing... }
            @else { 🔄 Send Transfer }
          </button>
        </form>
      </div>

      <!-- Info Panel -->
      <div class="glass-card animate-in stagger-2">
        <h4 style="margin-bottom:16px">🔄 About Transfers</h4>
        <div class="info-list">
          <div class="info-item"><span class="info-dot accent"></span><span>P2P transfers between any wallets</span></div>
          <div class="info-item"><span class="info-dot accent"></span><span>Requires exact wallet address</span></div>
          <div class="info-item"><span class="info-dot warning"></span><span>Daily limits apply to transfers</span></div>
          <div class="info-item"><span class="info-dot info"></span><span>Both wallets get ledger entries</span></div>
        </div>

        @if (sourceWallet()) {
          <div class="wallet-preview" style="margin-top:24px">
            <h4 style="margin-bottom:12px">Source Wallet</h4>
            <div class="wp-row"><span>Name</span><strong>{{ sourceWallet()!.walletName }}</strong></div>
            <div class="wp-row"><span>Available</span><strong class="text-success mono">{{ sourceWallet()!.availableBalance | currency:sourceWallet()!.currency:'symbol':'1.2-2' }}</strong></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .txn-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    @media(max-width:900px) { .txn-layout { grid-template-columns: 1fr; } }
    .info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-item { display: flex; align-items: flex-start; gap: 10px; font-size: 0.85rem; color: var(--text-secondary); }
    .info-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; &.accent{background:var(--accent);} &.warning{background:var(--warning);} &.info{background:var(--info);} }

    .transfer-arrow {
      display: flex; align-items: center; gap: 12px; margin: 4px 0 20px;
    }
    .ta-line { flex: 1; height: 1px; background: var(--border); }
    .ta-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(92,110,248,0.15); border: 1px solid rgba(92,110,248,0.3);
      display: flex; align-items: center; justify-content: center;
      color: var(--accent-light); font-size: 1.1rem; font-weight: 700;
    }

    .wallet-preview { background: var(--bg-input); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--border); }
    .wp-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.83rem; margin-bottom: 8px; span { color: var(--text-muted); } strong { color: var(--text-primary); } &:last-child { margin-bottom: 0; } }
  `]
})
export class TransferComponent implements OnInit {
  private fb        = inject(FormBuilder);
  private txnSvc    = inject(TransactionService);
  private walletSvc = inject(WalletService);
  private toast     = inject(ToastService);
  private router    = inject(Router);
  private route     = inject(ActivatedRoute);

  wallets   = signal<WalletResponse[]>([]);
  loading   = signal(false);
  currencies: Currency[] = ['INR','USD','EUR','GBP','AED','SGD'];

  form = this.fb.group({
    sourceWalletId:     ['', Validators.required],
    targetWalletAddress:['', Validators.required],
    amount:             [null as number | null, [Validators.required, Validators.min(0.01)]],
    currency:           ['INR', Validators.required],
    description:        [''],
    idempotencyKey:     ['']
  });

  get f() { return this.form.controls; }
  sourceWallet = () => this.wallets().find(w => w.id === this.form.get('sourceWalletId')?.value);
  currencySymbol = () => {
    const m: Record<string,string> = {INR:'₹',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',SGD:'S$'};
    return m[this.form.get('currency')?.value as string] ?? '$';
  };

  ngOnInit() {
    this.walletSvc.getMyWallets().subscribe({ next: res => this.wallets.set(res.data) });
    const wId = this.route.snapshot.queryParamMap.get('walletId');
    if (wId) this.form.patchValue({ sourceWalletId: wId });
  }

  genKey() { this.form.patchValue({ idempotencyKey: crypto.randomUUID() }); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const val = this.form.getRawValue() as any;
    if (!val.idempotencyKey) val.idempotencyKey = crypto.randomUUID();
    this.txnSvc.transfer(val).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Transfer Successful', 'Funds sent successfully.');
        this.router.navigate(['/transactions/history']);
      },
      error: () => this.loading.set(false)
    });
  }
}
