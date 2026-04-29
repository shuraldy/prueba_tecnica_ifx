import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, delay } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Vm, PaginatedVms, VmStats, VmsQuery, CreateVmPayload, UpdateVmPayload } from '../models/vm.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VmService {
  private readonly http = inject(HttpClient);

  readonly vms = signal<Vm[]>([]);
  readonly pagination = signal<Omit<PaginatedVms, 'data'>>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  readonly stats = signal<VmStats | null>(null);
  readonly loading = signal(false);

  private get apiUrl() { return `${environment.apiUrl}/vms`; }

  loadVms(query: VmsQuery = {}): Observable<PaginatedVms> {
    this.loading.set(true);
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== '')
    ) as Record<string, string>;

    return this.http.get<PaginatedVms>(this.apiUrl, { params }).pipe(
      delay(1500),
      tap(res => {
        this.vms.set(res.data);
        this.pagination.set({ total: res.total, page: res.page, limit: res.limit, totalPages: res.totalPages });
        this.loading.set(false);
      }),
      catchError(err => { this.loading.set(false); return throwError(() => err); })
    );
  }

  loadStats(): Observable<VmStats> {
    return this.http.get<VmStats>(`${this.apiUrl}/stats`).pipe(
      delay(1500),
      tap(s => this.stats.set(s))
    );
  }

  createVm(payload: CreateVmPayload): Observable<Vm> {
    const tempId = `temp-${Date.now()}`;
    const optimistic: Vm = { ...payload, id: tempId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.vms.update(list => [optimistic, ...list]);

    return this.http.post<Vm>(this.apiUrl, payload).pipe(
      tap(vm => this.vms.update(list => list.map(v => v.id === tempId ? vm : v))),
      catchError(err => {
        this.vms.update(list => list.filter(v => v.id !== tempId));
        return throwError(() => err);
      })
    );
  }

  updateVm(id: string, payload: UpdateVmPayload): Observable<Vm> {
    const snapshot = this.vms();
    this.vms.update(list => list.map(v => v.id === id ? { ...v, ...payload } : v));

    return this.http.put<Vm>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(vm => this.vms.update(list => list.map(v => v.id === id ? vm : v))),
      catchError(err => {
        this.vms.set(snapshot);
        return throwError(() => err);
      })
    );
  }

  updateStatus(id: string, status: Vm['status']): Observable<Vm> {
    const snapshot = this.vms();
    this.vms.update(list => list.map(v => v.id === id ? { ...v, status } : v));

    return this.http.patch<Vm>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(vm => this.vms.update(list => list.map(v => v.id === id ? vm : v))),
      catchError(err => {
        this.vms.set(snapshot);
        return throwError(() => err);
      })
    );
  }

  deleteVm(id: string): Observable<void> {
    const snapshot = this.vms();
    this.vms.update(list => list.filter(v => v.id !== id));

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        this.vms.set(snapshot);
        return throwError(() => err);
      })
    );
  }

  applySocketUpdate(vm: Vm) {
    const exists = this.vms().some(v => v.id === vm.id);
    if (exists) {
      this.vms.update(list => list.map(v => v.id === vm.id ? vm : v));
    } else {
      this.vms.update(list => [vm, ...list]);
    }
  }

  applySocketDelete(id: string) {
    this.vms.update(list => list.filter(v => v.id !== id));
  }

  applySocketStats(stats: VmStats) {
    this.stats.set(stats);
  }
}
