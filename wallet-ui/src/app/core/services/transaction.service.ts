import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, PageResponse,
  DepositRequest, WithdrawRequest, TransferRequest,
  TransactionResponse
} from '../../models/models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/transactions`;

  deposit(req: DepositRequest): Observable<ApiResponse<TransactionResponse>> {
    return this.http.post<ApiResponse<TransactionResponse>>(`${this.base}/deposit`, req);
  }

  withdraw(req: WithdrawRequest): Observable<ApiResponse<TransactionResponse>> {
    return this.http.post<ApiResponse<TransactionResponse>>(`${this.base}/withdraw`, req);
  }

  transfer(req: TransferRequest): Observable<ApiResponse<TransactionResponse>> {
    return this.http.post<ApiResponse<TransactionResponse>>(`${this.base}/transfer`, req);
  }

  getHistory(walletId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<TransactionResponse>>> {
    const params = new HttpParams()
      .set('walletId', walletId)
      .set('page', page)
      .set('size', size);
    return this.http.get<ApiResponse<PageResponse<TransactionResponse>>>(`${this.base}/history`, { params });
  }
}
