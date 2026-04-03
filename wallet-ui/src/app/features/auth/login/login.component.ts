import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
      </div>

      <div class="auth-container animate-scale">
        <!-- Brand -->
        <div class="auth-brand">
          <div class="brand-icon">💼</div>
          <h1>DigiWallet</h1>
          <p>Enterprise Digital Wallet Platform</p>
        </div>

        <!-- Card -->
        <div class="glass-card auth-card">
          <h2>Welcome back</h2>
          <p class="auth-subtitle">Sign in to your account</p>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <div class="form-group">
              <label class="form-label" for="emailOrUsername">Email or Username</label>
              <input id="emailOrUsername" type="text" class="form-control"
                     formControlName="emailOrUsername" placeholder="Enter your email or username"
                     autocomplete="username" />
              @if (f['emailOrUsername'].invalid && f['emailOrUsername'].touched) {
                <span class="form-error">⚠ Required field</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="input-group">
                <input id="password" [type]="showPass() ? 'text' : 'password'"
                       class="form-control has-suffix" formControlName="password"
                       placeholder="Enter your password" autocomplete="current-password" />
                <button type="button" class="input-suffix pw-toggle" (click)="showPass.update(v=>!v)">
                  {{ showPass() ? '🙈' : '👁️' }}
                </button>
              </div>
              @if (f['password'].invalid && f['password'].touched) {
                <span class="form-error">⚠ Password is required</span>
              }
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg"
                    [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span> Signing in...
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="auth-footer">
            Don't have an account?
            <a routerLink="/auth/register">Create one →</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--bg-primary);
    }

    .auth-bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
    }
    .orb-1 { width: 500px; height: 500px; background: var(--accent); top: -200px; left: -150px; animation: float 8s ease-in-out infinite; }
    .orb-2 { width: 400px; height: 400px; background: #a78bfa; bottom: -150px; right: -100px; animation: float 10s ease-in-out infinite reverse; }
    .orb-3 { width: 300px; height: 300px; background: var(--success); top: 40%; left: 60%; animation: float 12s ease-in-out infinite; }

    .auth-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 440px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .auth-brand {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .brand-icon { font-size: 2.8rem; animation: float 4s ease-in-out infinite; }
    .auth-brand h1 {
      font-size: 1.8rem;
      font-weight: 900;
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .auth-brand p { font-size: 0.83rem; color: var(--text-muted); }

    .auth-card {
      background: rgba(255,255,255,0.05);
      h2 { margin-bottom: 4px; }
    }
    .auth-subtitle { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 28px; }

    .pw-toggle {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.875rem;
      color: var(--text-muted);
      a { color: var(--accent-light); margin-left: 4px; font-weight: 600; }
    }
  `]
})
export class LoginComponent {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private router= inject(Router);
  private toast = inject(ToastService);

  loading  = signal(false);
  showPass = signal(false);

  form = this.fb.group({
    emailOrUsername: ['', Validators.required],
    password: ['', Validators.required]
  });

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.toast.success('Welcome back!', 'You have signed in successfully.');
        this.router.navigate(['/dashboard']);
      },
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
