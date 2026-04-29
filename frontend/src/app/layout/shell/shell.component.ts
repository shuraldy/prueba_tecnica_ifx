import { Component, inject, OnInit, OnDestroy } from '@angular/core';
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

  ngOnInit() {
    this.socket.connect();

    this.socket.onVmCreated().subscribe(vm => {
      this.vmService.applySocketUpdate(vm);
      this.toast.info('VM creada', `"${vm.name}" fue agregada`);
    });

    this.socket.onVmUpdated().subscribe(vm => {
      this.vmService.applySocketUpdate(vm);
    });

    this.socket.onVmDeleted().subscribe(id => {
      this.vmService.applySocketDelete(id);
      this.toast.info('VM eliminada', 'Una VM fue eliminada');
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
