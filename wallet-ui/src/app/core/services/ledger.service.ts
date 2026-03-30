import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse, LedgerEntryResponse } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class LedgerService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/v1/ledger`;

  getLedger(walletId: string, page = 0, size = 20): Observable<ApiResponse<PageResponse<LedgerEntryResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<LedgerEntryResponse>>>(`${this.base}/${walletId}`, { params });
  }
}
