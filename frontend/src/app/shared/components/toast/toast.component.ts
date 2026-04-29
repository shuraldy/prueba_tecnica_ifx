import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      @for (msg of toast.messages(); track msg.id) {
        <div @slideIn class="flex items-start gap-3 p-4 rounded-xl border shadow-2xl cursor-pointer backdrop-blur-sm"
             [class]="severityClass(msg.severity)"
             (click)="toast.dismiss(msg.id)">
          <i class="pi mt-0.5 text-base" [class]="iconClass(msg.severity)"></i>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">{{ msg.summary }}</p>
            @if (msg.detail) {
              <p class="text-xs opacity-75 mt-0.5">{{ msg.detail }}</p>
            }
          </div>
          <i class="pi pi-times text-xs opacity-50 mt-0.5 shrink-0"></i>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);

  severityClass(s: string): string {
    const map: Record<string, string> = {
      success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300',
      error:   'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-300',
      info:    'bg-indigo-50 dark:bg-indigo-950/90 border-indigo-200 dark:border-indigo-700/50 text-indigo-800 dark:text-indigo-300',
      warn:    'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-700/50 text-amber-800 dark:text-amber-300',
    };
    return map[s] ?? map['info'];
  }

  iconClass(s: string): string {
    const map: Record<string, string> = {
      success: 'pi-check-circle',
      error:   'pi-times-circle',
      info:    'pi-info-circle',
      warn:    'pi-exclamation-triangle',
    };
    return map[s] ?? map['info'];
  }
}
