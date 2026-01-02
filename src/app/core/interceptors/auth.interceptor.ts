import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  
  // Não adiciona token para rotas públicas (login, forgot-password)
  const publicRoutes = ['/auth/login', '/auth/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));
  
  let clonedRequest = req;
  
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('auth_token');

    // Adiciona token em TODAS as requisições que não são públicas
    if (token && !isPublicRoute) {
      clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('🔐 Token sendo enviado para:', req.url);
      console.log('🔑 Header Authorization:', `Bearer ${token.substring(0, 30)}...`);
    } else if (!isPublicRoute) {
      console.warn('⚠️ Token NÃO encontrado para:', req.url);
    }
  }
  
  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se receber 401 e não for rota pública, limpa o token e redireciona
      if (error.status === 401 && isPlatformBrowser(platformId) && !isPublicRoute) {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
        }
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};

