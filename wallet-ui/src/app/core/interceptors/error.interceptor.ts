import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        // Try token refresh
        return auth.refreshToken().pipe(
          switchMap(res => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${res.data.accessToken}` }
            });
            return next(retried);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }

      const message = err.error?.message ?? err.message ?? 'An unexpected error occurred';

      if (err.status === 0) {
        toast.error('Connection Failed', 'Cannot reach the server. Please check if the backend is running.');
      } else if (err.status !== 401) {
        toast.error(`Error ${err.status}`, message);
      }

      return throwError(() => err);
    })
  );
};
