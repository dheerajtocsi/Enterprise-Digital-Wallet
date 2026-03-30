import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
      </div>

      <div class="auth-container animate-scale" style="max-width:500px">
        <div class="auth-brand">
          <div class="brand-icon">💼</div>
          <h1>DigiWallet</h1>
          <p>Create your enterprise account</p>
        </div>

        <div class="glass-card auth-card">
          <h2>Create account</h2>
          <p class="auth-subtitle" style="margin-bottom:24px">Fill in your details below</p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="grid-2" style="gap:16px">
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label" for="fullName">Full Name</label>
                <input id="fullName" type="text" class="form-control"
                       formControlName="fullName" placeholder="John Doe" />
                @if (f['fullName'].invalid && f['fullName'].touched) {
                  <span class="form-error">⚠ Full name required (2-200 chars)</span>
                }
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-label" for="username">Username</label>
                <input id="username" type="text" class="form-control"
                       formControlName="username" placeholder="john_doe" />
                @if (f['username'].invalid && f['username'].touched) {
                  <span class="form-error">⚠ 3-50 chars, letters/numbers/_</span>
                }
              </div>
            </div>

            <div class="form-group" style="margin-top:16px">
              <label class="form-label" for="email">Email</label>
              <input id="email" type="email" class="form-control"
                     formControlName="email" placeholder="john@company.com" />
              @if (f['email'].invalid && f['email'].touched) {
                <span class="form-error">⚠ Valid email required</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Phone (optional)</label>
              <input id="phone" type="tel" class="form-control"
                     formControlName="phone" placeholder="9876543210" />
              @if (f['phone'].invalid && f['phone'].touched) {
                <span class="form-error">⚠ Valid 10-digit Indian phone number</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <div class="input-group">
                <input id="reg-password" [type]="showPass() ? 'text' : 'password'"
                       class="form-control has-suffix" formControlName="password"
                       placeholder="Min 8 chars" />
                <button type="button" class="input-suffix pw-toggle" (click)="showPass.update(v=>!v)">
                  {{ showPass() ? '🙈' : '👁️' }}
                </button>
              </div>
              <!-- Strength meter -->
              <div class="strength-meter">
                @for (i of [1,2,3,4]; track i) {
                  <div class="strength-bar" [class]="strengthClass(i)"></div>
                }
              </div>
              <span class="strength-label">{{ strengthLabel() }}</span>
              @if (f['password'].invalid && f['password'].touched) {
                <span class="form-error">⚠ Min 8 chars with uppercase, lowercase, digit & special char</span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg"
                    [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span> Creating account...
              } @else {
                Create Account
              }
            </button>
          </form>

          <div class="auth-footer">
            Already have an account?
            <a routerLink="/auth/login">Sign in →</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden; background: var(--bg-primary);
    }
    .auth-bg { position: absolute; inset: 0; pointer-events: none; }
    .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
    .orb-1 { width: 500px; height: 500px; background: #a78bfa; top: -200px; right: -150px; animation: float 9s ease-in-out infinite; }
    .orb-2 { width: 400px; height: 400px; background: var(--accent); bottom: -100px; left: -100px; animation: float 11s ease-in-out infinite reverse; }

    .auth-container {
      position: relative; z-index: 10;
      width: 100%; padding: 20px;
      display: flex; flex-direction: column; gap: 24px;
    }
    .auth-brand { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .brand-icon { font-size: 2.4rem; animation: float 4s ease-in-out infinite; }
    .auth-brand h1 { font-size: 1.6rem; font-weight: 900; background: var(--gradient-accent); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .auth-brand p  { font-size: 0.83rem; color: var(--text-muted); }
    .auth-card { background: rgba(255,255,255,0.05); }
    .auth-subtitle { color: var(--text-muted); font-size: 0.875rem; }
    .pw-toggle { background: transparent; border: none; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; }

    .strength-meter {
      display: flex; gap: 6px; margin-top: 8px;
    }
    .strength-bar {
      flex: 1; height: 4px; border-radius: 99px;
      background: var(--border);
      transition: background 0.3s;
      &.weak   { background: var(--danger); }
      &.fair   { background: var(--warning); }
      &.good   { background: var(--info); }
      &.strong { background: var(--success); }
    }
    .strength-label { font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; display: block; }

    .auth-footer { text-align: center; margin-top: 20px; font-size: 0.875rem; color: var(--text-muted); a { color: var(--accent-light); margin-left: 4px; font-weight: 600; } }
  `]
})
export class RegisterComponent {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router= inject(Router);
  private toast = inject(ToastService);

  loading  = signal(false);
  showPass = signal(false);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50),
                    Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    email:    ['', [Validators.required, Validators.email]],
    phone:    ['', Validators.pattern(/^[6-9]\d{9}$/)],
    password: ['', [Validators.required, Validators.minLength(8),
                    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/)]]
  });

  get f() { return this.form.controls; }

  private get pwVal(): string { return this.form.get('password')?.value ?? ''; }

  private get strength(): number {
    const pw = this.pwVal;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[@$!%*?&]/.test(pw)) score++;
    return score;
  }

  strengthClass(bar: number): string {
    const s = this.strength;
    if (s === 0 || bar > s) return '';
    if (s === 1) return 'weak';
    if (s === 2) return 'fair';
    if (s === 3) return 'good';
    return 'strong';
  }
  strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strength];
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { phone, ...rest } = this.form.getRawValue() as any;
    const payload = phone ? { ...rest, phone } : rest;

    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.success('Account created!', 'Welcome to DigiWallet.');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
