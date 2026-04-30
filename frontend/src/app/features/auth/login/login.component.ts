import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly features = [
    { icon: 'pi pi-bolt',       label: 'Actualizaciones en tiempo real vía WebSockets' },
    { icon: 'pi pi-chart-bar',  label: 'Métricas y estadísticas de recursos' },
    { icon: 'pi pi-users',      label: 'Control de acceso por roles' },
    { icon: 'pi pi-history',    label: 'Gestión completa del ciclo de vida' },
  ];

  readonly form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  autofill(role: 'admin' | 'client') {
    const creds = {
      admin:  { email: 'admin@ifx.com',   password: 'Admin123!' },
      client: { email: 'cliente@ifx.com', password: 'Cliente123!' },
    };
    this.form.setValue(creds[role]);
    this.error.set('');
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Credenciales incorrectas. Verifica tu email y contraseña.');
        this.loading.set(false);
      },
    });
  }

  fieldError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
