import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'vms',
        loadComponent: () => import('./features/vms/vms-list/vms-list.component').then(m => m.VmsListComponent),
      },
      {
        path: 'vms/new',
        loadComponent: () => import('./features/vms/vm-form/vm-form.component').then(m => m.VmFormComponent),
      },
      {
        path: 'vms/:id/edit',
        loadComponent: () => import('./features/vms/vm-form/vm-form.component').then(m => m.VmFormComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
