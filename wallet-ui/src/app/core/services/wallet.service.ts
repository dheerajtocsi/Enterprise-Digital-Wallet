import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, CreateWalletRequest, WalletResponse } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/wallets`;

  createWallet(req: CreateWalletRequest): Observable<ApiResponse<WalletResponse>> {
    return this.http.post<ApiResponse<WalletResponse>>(this.base, req);
  }

  getMyWallets(): Observable<ApiResponse<WalletResponse[]>> {
    return this.http.get<ApiResponse<WalletResponse[]>>(`${this.base}/me`);
  }

  getWalletById(walletId: string): Observable<ApiResponse<WalletResponse>> {
    return this.http.get<ApiResponse<WalletResponse>>(`${this.base}/${walletId}`);
  }

  getBalance(walletId: string): Observable<ApiResponse<{ walletId: string; balance: number }>> {
    return this.http.get<ApiResponse<{ walletId: string; balance: number }>>(`${this.base}/${walletId}/balance`);
  }
}
