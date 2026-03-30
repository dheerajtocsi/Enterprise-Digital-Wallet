import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [loginGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'wallets',
        loadComponent: () => import('./features/wallets/wallet-list/wallet-list.component').then(m => m.WalletListComponent)
      },
      {
        path: 'wallets/:id',
        loadComponent: () => import('./features/wallets/wallet-detail/wallet-detail.component').then(m => m.WalletDetailComponent)
      },
      {
        path: 'transactions/deposit',
        loadComponent: () => import('./features/transactions/deposit/deposit.component').then(m => m.DepositComponent)
      },
      {
        path: 'transactions/withdraw',
        loadComponent: () => import('./features/transactions/withdraw/withdraw.component').then(m => m.WithdrawComponent)
      },
      {
        path: 'transactions/transfer',
        loadComponent: () => import('./features/transactions/transfer/transfer.component').then(m => m.TransferComponent)
      },
      {
        path: 'transactions/history',
        loadComponent: () => import('./features/transactions/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'ledger/:walletId',
        loadComponent: () => import('./features/ledger/ledger.component').then(m => m.LedgerComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
