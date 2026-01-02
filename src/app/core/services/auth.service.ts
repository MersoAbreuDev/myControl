import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly MOCK_EMAIL = 'mersoabreu@gmail.com';
  private readonly MOCK_PASSWORD = '123456';
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private router: Router) {}

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Simula uma chamada assíncrona
      setTimeout(() => {
        if (email === this.MOCK_EMAIL && password === this.MOCK_PASSWORD) {
          const token = this.generateToken();
          localStorage.setItem(this.TOKEN_KEY, token);
          this.isAuthenticatedSubject.next(true);
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, 500);
    });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): string | null {
    return this.MOCK_EMAIL;
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private generateToken(): string {
    return 'mock_token_' + Date.now();
  }

  resetPassword(email: string): Observable<boolean> {
    return new Observable(observer => {
      // Simula envio de email
      setTimeout(() => {
        if (email === this.MOCK_EMAIL) {
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, 500);
    });
  }
}

