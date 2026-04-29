export type VmStatus = 'Encendida' | 'Apagada' | 'Suspendida';

export interface Vm {
  id: string;
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: VmStatus;
  createdAt: string;
  updatedAt: string;
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

export interface VmsQuery {
  page?: number;
  limit?: number;
  status?: VmStatus;
  search?: string;
}

export interface CreateVmPayload {
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: VmStatus;
}

export type UpdateVmPayload = Partial<CreateVmPayload>;
