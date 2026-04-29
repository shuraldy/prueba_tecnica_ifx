import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);

  private get apiUrl() { return `${environment.apiUrl}/auth`; }

  login(email: string, password: string): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => this.currentUser.set(res.user))
    );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/login']);
      })
    );
  }

  loadCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`).pipe(
      tap(res => this.currentUser.set(res.user))
    );
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Administrador';
  }
}
