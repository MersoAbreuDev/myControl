import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            // Verifica se o token está realmente salvo antes de navegar
            const token = localStorage.getItem('auth_token');
            if (token) {
              // Navega imediatamente - o guard vai verificar o token
              this.router.navigate(['/home']).catch(() => {
                // Se falhar, força o redirecionamento
                window.location.href = '/home';
              });
            } else {
              console.error('❌ Token não encontrado após login');
              this.errorMessage = 'Erro ao salvar token. Tente novamente.';
            }
          } else {
            this.errorMessage = 'Email ou senha incorretos';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Erro no login:', error);
          this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}

