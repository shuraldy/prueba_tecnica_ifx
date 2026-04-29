import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { VmService } from '../../../core/services/vm.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-vm-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, InputTextModule, InputNumberModule, SelectModule, ButtonModule],
  templateUrl: './vm-form.component.html',
})
export class VmFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vmService = inject(VmService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly isEdit = signal(false);
  private vmId: string | null = null;

  readonly statusOptions = [
    { label: 'Encendida', value: 'Encendida' },
    { label: 'Apagada', value: 'Apagada' },
    { label: 'Suspendida', value: 'Suspendida' },
  ];

  readonly form = this.fb.group({
    name:   ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    cores:  [null as number | null, [Validators.required, Validators.min(1)]],
    ram:    [null as number | null, [Validators.required, Validators.min(512)]],
    disk:   [null as number | null, [Validators.required, Validators.min(10)]],
    os:     ['', [Validators.required, Validators.minLength(2)]],
    status: ['Apagada', Validators.required],
  });

  ngOnInit() {
    this.vmId = this.route.snapshot.paramMap.get('id');
    if (this.vmId) {
      this.isEdit.set(true);
      const vm = this.vmService.vms().find(v => v.id === this.vmId);
      if (vm) {
        this.form.patchValue(vm);
      } else {
        this.router.navigate(['/vms']);
      }
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const payload = this.form.value as any;

    const action$ = this.isEdit()
      ? this.vmService.updateVm(this.vmId!, payload)
      : this.vmService.createVm(payload);

    action$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'VM actualizada' : 'VM creada', payload.name);
        this.router.navigate(['/vms']);
      },
      error: (err) => {
        this.toast.error('Error', err?.error?.message ?? 'No se pudo guardar la VM');
        this.loading.set(false);
      },
    });
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  errMsg(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required']) return 'Campo requerido';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    if (c.errors['min']) return `Valor mínimo: ${c.errors['min'].min}`;
    if (c.errors['pattern']) return 'Solo letras, números, guiones y underscores';
    return 'Valor inválido';
  }
}
