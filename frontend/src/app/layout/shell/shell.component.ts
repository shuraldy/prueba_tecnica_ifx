import { Component, inject, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { VmService } from '../../core/services/vm.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/theme.service';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ButtonModule, AvatarModule, TooltipModule, ToastComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly socket = inject(SocketService);
  private readonly vmService = inject(VmService);
  private readonly toast = inject(ToastService);

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);

  @HostListener('document:keydown.escape')
  closeSidebar() { this.sidebarOpen.set(false); }

  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  toggleCollapsed() { this.sidebarCollapsed.update(v => !v); }

  ngOnInit() {
    this.socket.connect();

    this.socket.onVmCreated().subscribe(vm => {
      this.vmService.applySocketUpdate(vm);
      if (!this.auth.isAdmin()) {
        this.toast.info('Nueva VM disponible', `"${vm.name}" fue agregada`);
      }
    });

    this.socket.onVmUpdated().subscribe(vm => {
      const prev = this.vmService.vms().find(v => v.id === vm.id);
      this.vmService.applySocketUpdate(vm);
      if (!this.auth.isAdmin()) {
        const changes: string[] = [];
        if (prev) {
          if (prev.name   !== vm.name)   changes.push(`Nombre: ${vm.name}`);
          if (prev.os     !== vm.os)     changes.push(`OS: ${vm.os}`);
          if (prev.cores  !== vm.cores)  changes.push(`vCPU: ${vm.cores}`);
          if (prev.ram    !== vm.ram)    changes.push(`RAM: ${vm.ram} MB`);
          if (prev.disk   !== vm.disk)   changes.push(`Disco: ${vm.disk} GB`);
          if (prev.status !== vm.status) changes.push(`Estado: ${vm.status}`);
        }
        const detail = changes.length ? changes.join(' · ') : 'Datos actualizados';
        this.toast.info(`"${vm.name}" actualizada`, detail);
      }
    });

    this.socket.onVmDeleted().subscribe(id => {
      this.vmService.applySocketDelete(id);
      if (!this.auth.isAdmin()) {
        this.toast.warn('VM eliminada', 'Una máquina virtual fue eliminada');
      }
    });

    this.socket.onVmStats().subscribe(stats => {
      this.vmService.applySocketStats(stats);
    });
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  logout() {
    this.auth.logout().subscribe();
  }

  get userInitials(): string {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }
}
