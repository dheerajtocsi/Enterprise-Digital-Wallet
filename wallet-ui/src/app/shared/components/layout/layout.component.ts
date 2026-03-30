import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout" [class.sidebar-open]="sidebarOpen()">
      <!-- Sidebar Overlay (mobile) -->
      <div class="sidebar-overlay" (click)="sidebarOpen.set(false)"></div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">💼</span>
            <div>
              <span class="logo-text">DigiWallet</span>
              <span class="logo-sub">Enterprise</span>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <span class="nav-label">Overview</span>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">⬛</span>
              Dashboard
            </a>
          </div>

          <div class="nav-section">
            <span class="nav-label">Wallets</span>
            <a routerLink="/wallets" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">👛</span>
              My Wallets
            </a>
          </div>

          <div class="nav-section">
            <span class="nav-label">Transactions</span>
            <a routerLink="/transactions/deposit" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">⬇️</span>
              Deposit
            </a>
            <a routerLink="/transactions/withdraw" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">⬆️</span>
              Withdraw
            </a>
            <a routerLink="/transactions/transfer" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">🔄</span>
              Transfer
            </a>
            <a routerLink="/transactions/history" routerLinkActive="active" class="nav-item" (click)="sidebarOpen.set(false)">
              <span class="nav-icon">📋</span>
              History
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-details">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-role">{{ userRole() }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" title="Logout">⏻</button>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-area">
        <!-- Topbar -->
        <header class="topbar">
          <button class="menu-toggle" (click)="sidebarOpen.update(v => !v)">
            <span></span><span></span><span></span>
          </button>
          <div class="topbar-right">
            <div class="topbar-user">
              <div class="user-avatar sm">{{ userInitials() }}</div>
              <span class="user-name">{{ userName() }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sidebar-w);
      background: var(--gradient-sidebar);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 200;
      transition: transform var(--transition-slow);
    }

    .sidebar-header {
      padding: 24px 20px 20px;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon { font-size: 1.6rem; }
    .logo-text {
      display: block;
      font-weight: 800;
      font-size: 1.05rem;
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .logo-sub {
      display: block;
      font-size: 0.68rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 600;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 8px;
    }

    .nav-label {
      font-size: 0.67rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      padding: 8px 12px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all var(--transition);

      .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }

      &:hover {
        background: rgba(255,255,255,0.06);
        color: var(--text-primary);
      }
      &.active {
        background: rgba(92,110,248,0.15);
        color: var(--accent-light);
        font-weight: 600;
        border: 1px solid rgba(92,110,248,0.2);
      }
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .user-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: var(--gradient-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
      &.sm { width: 30px; height: 30px; font-size: 0.7rem; }
    }

    .user-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .user-name {
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .logout-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      width: 34px; height: 34px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 1.1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all var(--transition);
      flex-shrink: 0;
      &:hover {
        background: var(--danger-dim);
        border-color: var(--danger);
        color: var(--danger);
      }
    }

    /* ── Main Area ── */
    .main-area {
      margin-left: var(--sidebar-w);
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    /* ── Topbar ── */
    .topbar {
      height: var(--topbar-h);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      background: rgba(5,8,22,0.8);
      backdrop-filter: blur(20px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      span {
        display: block;
        width: 22px; height: 2px;
        background: var(--text-secondary);
        border-radius: 99px;
        transition: all var(--transition);
      }
    }

    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .topbar-user  { display: flex; align-items: center; gap: 10px; }

    /* ── Page Content ── */
    .page-content {
      padding: 32px;
      flex: 1;
    }

    /* ── Sidebar Overlay ── */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 190;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .sidebar {
        transform: translateX(-100%);
        &.visible { transform: none; }
      }
      .main-area { margin-left: 0; }
      .menu-toggle { display: flex; }

      .app-layout.sidebar-open {
        .sidebar { transform: none; }
        .sidebar-overlay { display: block; }
      }
    }

    @media (max-width: 600px) {
      .page-content { padding: 20px 16px; }
      .topbar { padding: 0 16px; }
      .topbar-user .user-name { display: none; }
    }
  `]
})
export class LayoutComponent {
  private auth = inject(AuthService);
  sidebarOpen  = signal(false);

  userName()  { return this.auth.currentUser()?.fullName ?? this.auth.currentUser()?.username ?? 'User'; }
  userRole()  {
    const role = this.auth.currentUser()?.role;
    return role === 'ROLE_ADMIN' ? 'Admin' : 'User';
  }
  userInitials() {
    const name = this.userName();
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() { this.auth.logout(); }
}
