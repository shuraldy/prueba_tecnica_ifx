import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn';

export interface ToastMessage {
  id: number;
  severity: ToastSeverity;
  summary: string;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private counter = 0;

  show(severity: ToastSeverity, summary: string, detail?: string) {
    const id = ++this.counter;
    this.messages.update(msgs => [...msgs, { id, severity, summary, detail }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(summary: string, detail?: string) { this.show('success', summary, detail); }
  error(summary: string, detail?: string)   { this.show('error', summary, detail); }
  info(summary: string, detail?: string)    { this.show('info', summary, detail); }

  dismiss(id: number) {
    this.messages.update(msgs => msgs.filter(m => m.id !== id));
  }
}
