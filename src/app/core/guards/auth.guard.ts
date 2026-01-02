import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Verifica diretamente o token no localStorage para garantir que está atualizado
  let hasToken = false;
  
  if (isPlatformBrowser(platformId)) {
    hasToken = !!localStorage.getItem('auth_token');
  }
  
  if (hasToken) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

