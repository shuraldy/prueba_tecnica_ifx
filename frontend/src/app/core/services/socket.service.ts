import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vm, VmStats } from '../models/vm.model';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    this.socket = io(environment.socketUrl, { withCredentials: true, transports: ['websocket'] });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onVmCreated(): Observable<Vm> {
    return this.fromEvent<Vm>('vm:created');
  }

  onVmUpdated(): Observable<Vm> {
    return this.fromEvent<Vm>('vm:updated');
  }

  onVmDeleted(): Observable<string> {
    return this.fromEvent<string>('vm:deleted');
  }

  onVmStats(): Observable<VmStats> {
    return this.fromEvent<VmStats>('vm:stats');
  }

  private fromEvent<T>(event: string): Observable<T> {
    return new Observable(observer => {
      this.socket?.on(event, (data: T) => observer.next(data));
      return () => this.socket?.off(event);
    });
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
