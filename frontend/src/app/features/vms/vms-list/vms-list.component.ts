import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { VmService } from '../../../core/services/vm.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { Vm, VmStatus, VmsQuery } from '../../../core/models/vm.model';

@Component({
  selector: 'app-vms-list',
  standalone: true,
  imports: [CommonModule, NgClass, RouterLink, FormsModule, ButtonModule, CardModule, InputTextModule, SelectModule, TooltipModule, StatusBadgeComponent, SkeletonComponent, PaginatorComponent],
  templateUrl: './vms-list.component.html',
})
export class VmsListComponent implements OnInit {
  readonly vmService = inject(VmService);
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmationService);

  search = '';
  statusFilter: VmStatus | '' = '';
  readonly updatedVmId = signal<string | null>(null);

  readonly statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Encendida', value: 'Encendida' },
    { label: 'Apagada', value: 'Apagada' },
    { label: 'Suspendida', value: 'Suspendida' },
  ];

  ngOnInit() {
    this.vmService.pagination.update(p => ({ ...p, page: 1, limit: 6 }));
    this.load();
  }

  load() {
    const query: VmsQuery = {
      page: this.vmService.pagination().page,
      limit: this.vmService.pagination().limit,
      search: this.search || undefined,
      status: (this.statusFilter as VmStatus) || undefined,
    };
    this.vmService.loadVms(query).subscribe();
  }

  applyFilters() {
    this.vmService.pagination.update(p => ({ ...p, page: 1 }));
    this.load();
  }

  goToPage(page: number, limit?: number) {
    this.vmService.pagination.update(p => ({ ...p, page, ...(limit ? { limit } : {}) }));
    this.load();
  }

  cycleStatus(event: Event, vm: Vm) {
    if (!this.auth.isAdmin()) return;
    const next: Record<VmStatus, VmStatus> = { Encendida: 'Apagada', Apagada: 'Encendida', Suspendida: 'Encendida' };
    const action = next[vm.status];
    const isOn   = action === 'Encendida';
    this.confirm.confirm({
      target: event.target as EventTarget,
      message: `¿${isOn ? 'Encender' : 'Apagar'} la VM "${vm.name}"?`,
      header: isOn ? 'Encender VM' : 'Apagar VM',
      icon: isOn ? 'pi pi-play' : 'pi pi-pause',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: isOn ? 'Encender' : 'Apagar', severity: isOn ? 'success' : 'warn' },
      accept: () => {
        this.vmService.updateStatus(vm.id, action).subscribe({
          next: updated => {
            this.highlightVm(updated.id);
            this.toast.success('Estado actualizado', `${updated.name} → ${updated.status}`);
          },
          error: () => this.toast.error('Error', 'No se pudo actualizar el estado'),
        });
      },
    });
  }

  deleteVm(event: Event, vm: Vm) {
    this.confirm.confirm({
      target: event.target as EventTarget,
      message: `¿Eliminar "${vm.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Eliminar',
        severity: 'danger',
      },
      accept: () => {
        this.vmService.deleteVm(vm.id).subscribe({
          next: () => this.toast.success('VM eliminada', vm.name),
          error: () => this.toast.error('Error', 'No se pudo eliminar la VM'),
        });
      },
    });
  }

  private highlightVm(id: string) {
    this.updatedVmId.set(id);
    setTimeout(() => this.updatedVmId.set(null), 1500);
  }

  trackById(_: number, vm: Vm) { return vm.id; }
}
