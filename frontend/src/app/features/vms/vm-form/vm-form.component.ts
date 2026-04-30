import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { VmService } from '../../../core/services/vm.service';
import { VmResourcesService } from '../../../core/services/vm-resources.service';
import { ToastService } from '../../../core/services/toast.service';
import { VmOsOption } from '../../../core/models/vm.model';

@Component({
  selector: 'app-vm-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterLink,
    InputTextModule, SelectModule, ButtonModule,
    AutoCompleteModule, DialogModule, SkeletonModule,
  ],
  templateUrl: './vm-form.component.html',
})
export class VmFormComponent implements OnInit {
  private readonly fb        = inject(FormBuilder);
  private readonly vmService = inject(VmService);
  readonly resources         = inject(VmResourcesService);
  private readonly toast     = inject(ToastService);
  private readonly router    = inject(Router);
  private readonly route     = inject(ActivatedRoute);

  readonly loading     = signal(false);
  readonly loadingForm = signal(false);
  readonly isEdit      = signal(false);
  private vmId: string | null = null;

  // OS autocomplete
  osSuggestions: VmOsOption[] = [];
  selectedOs: VmOsOption | null = null;

  // New OS modal
  readonly showOsDialog   = signal(false);
  readonly newOsName      = signal('');
  readonly savingOs       = signal(false);

  readonly statusOptions = [
    { label: 'Encendida',  value: 'Encendida' },
    { label: 'Apagada',    value: 'Apagada' },
    { label: 'Suspendida', value: 'Suspendida' },
  ];

  readonly form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    cores:   [null as number | null, Validators.required],
    ram:     [null as number | null, Validators.required],
    disk:    [null as number | null, Validators.required],
    status:  ['Apagada', Validators.required],
  });

  ngOnInit() {
    this.resources.loadAll();
    this.vmId = this.route.snapshot.paramMap.get('id');
    this.loadingForm.set(true);

    setTimeout(() => {
      if (this.vmId) {
        this.isEdit.set(true);
        const vm = this.vmService.vms().find(v => v.id === this.vmId);
        if (vm) {
          this.form.patchValue({ name: vm.name, cores: vm.cores, ram: vm.ram, disk: vm.disk, status: vm.status });
          const osOption = this.resources.osList().find(o => o.name === vm.os) ?? { id: '', name: vm.os, isCustom: false };
          this.selectedOs = osOption;
        } else {
          this.router.navigate(['/vms']);
          return;
        }
      }
      this.loadingForm.set(false);
    }, 1500);
  }

  searchOs(event: { query: string }) {
    const q = event.query.toLowerCase();
    this.osSuggestions = this.resources.osList().filter(o => o.name.toLowerCase().includes(q));
  }

  openOsDialog() {
    this.newOsName.set('');
    this.showOsDialog.set(true);
  }

  saveNewOs() {
    const name = this.newOsName().trim();
    if (!name) return;
    this.savingOs.set(true);
    this.resources.createOs(name).subscribe({
      next: os => {
        this.selectedOs = os;
        this.showOsDialog.set(false);
        this.savingOs.set(false);
        this.toast.success('OS creado', os.name);
      },
      error: err => {
        this.toast.error('Error', err?.error?.message ?? 'No se pudo crear el OS');
        this.savingOs.set(false);
      },
    });
  }

  submit() {
    if (this.form.invalid || !this.selectedOs) {
      this.form.markAllAsTouched();
      if (!this.selectedOs) this.toast.warn('Atención', 'Selecciona un sistema operativo');
      return;
    }
    this.loading.set(true);
    const { name, cores, ram, disk, status } = this.form.value;
    const payload = { name: name!, cores: cores!, ram: ram!, disk: disk!, os: this.selectedOs.name, status: status as any };

    const action$ = this.isEdit()
      ? this.vmService.updateVm(this.vmId!, payload)
      : this.vmService.createVm(payload);

    action$.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'VM actualizada' : 'VM creada', payload.name);
        this.router.navigate(['/vms']);
      },
      error: err => {
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
    if (c.errors['required'])   return 'Campo requerido';
    if (c.errors['minlength'])  return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c.errors['maxlength'])  return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    if (c.errors['min'])        return `Valor mínimo: ${c.errors['min'].min}`;
    if (c.errors['pattern'])    return 'Solo letras, números, guiones y underscores';
    return 'Valor inválido';
  }
}
