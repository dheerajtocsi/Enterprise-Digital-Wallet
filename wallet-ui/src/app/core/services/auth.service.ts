import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../../models/models';

const TOKEN_KEY   = 'wallet_access_token';
const REFRESH_KEY = 'wallet_refresh_token';
const USER_KEY    = 'wallet_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private base   = `${environment.apiUrl}/api/v1/auth`;

  // ── Signals ────────────────────────────────────────────────
  private _token   = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user    = signal<UserResponse | null>(
    JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  );

  readonly token       = this._token.asReadonly();
  readonly currentUser = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._token());

  // ── Auth Endpoints ─────────────────────────────────────────
  login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/login`, req).pipe(
      tap(res => this._persist(res.data))
    );
  }

  register(req: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/register`, req).pipe(
      tap(res => this._persist(res.data))
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/refresh`, { refreshToken }).pipe(
      tap(res => this._persist(res.data))
    );
  }

  logout(): void {
    const token = this._token();
    if (token) {
      this.http.post(`${this.base}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({ error: () => {} });
    }
    this._clear();
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return this._token();
  }

  // ── Private Helpers ────────────────────────────────────────
  private _persist(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_KEY, auth.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    this._token.set(auth.accessToken);
    this._user.set(auth.user);
  }

  private _clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }
}
