import { Component, input } from '@angular/core';
import { VmStatus } from '../../../core/models/vm.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          [class]="badgeClass()">
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      {{ status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<VmStatus>();

  badgeClass(): string {
    const map: Record<VmStatus, string> = {
      Encendida:  'badge-on',
      Apagada:    'badge-off',
      Suspendida: 'badge-suspended',
    };
    return map[this.status()];
  }

  dotClass(): string {
    const map: Record<VmStatus, string> = {
      Encendida:  'bg-emerald-500 animate-pulse',
      Apagada:    'bg-red-400',
      Suspendida: 'bg-amber-500',
    };
    return map[this.status()];
  }
}
