import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VmCoreOption, VmRamOption, VmDiskOption, VmOsOption } from '../models/vm.model';

@Injectable({ providedIn: 'root' })
export class VmResourcesService {
  private readonly http = inject(HttpClient);
  private get base() { return `${environment.apiUrl}/vm-resources`; }

  readonly cores  = signal<VmCoreOption[]>([]);
  readonly rams   = signal<VmRamOption[]>([]);
  readonly disks  = signal<VmDiskOption[]>([]);
  readonly osList = signal<VmOsOption[]>([]);

  loadAll() {
    this.http.get<VmCoreOption[]>(`${this.base}/cores`).subscribe(v => this.cores.set(v));
    this.http.get<VmRamOption[]>(`${this.base}/ram`).subscribe(v => this.rams.set(v));
    this.http.get<VmDiskOption[]>(`${this.base}/disk`).subscribe(v => this.disks.set(v));
    this.http.get<VmOsOption[]>(`${this.base}/os`).subscribe(v => this.osList.set(v));
  }

  createOs(name: string): Observable<VmOsOption> {
    return this.http.post<VmOsOption>(`${this.base}/os`, { name }).pipe(
      tap(os => this.osList.update(list => [...list, os].sort((a, b) => a.name.localeCompare(b.name))))
    );
  }
}
