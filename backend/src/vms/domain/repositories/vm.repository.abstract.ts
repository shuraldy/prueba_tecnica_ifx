import { Vm, VmStatus } from '../entities/vm.entity';

export interface VmsFilter {
  status?: VmStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedVms {
  data: Vm[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VmStats {
  totalVms: number;
  byStatus: Record<VmStatus, number>;
  totalCores: number;
  totalRam: number;
  totalDisk: number;
}

export abstract class VmRepository {
  abstract findAll(filter?: VmsFilter): Promise<PaginatedVms>;
  abstract findById(id: string): Promise<Vm | null>;
  abstract getStats(): Promise<VmStats>;
  abstract create(vm: Partial<Vm>): Promise<Vm>;
  abstract update(id: string, vm: Partial<Vm>): Promise<Vm>;
  abstract delete(id: string): Promise<void>;
}
