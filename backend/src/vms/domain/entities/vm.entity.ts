export type VmStatus = 'Encendida' | 'Apagada' | 'Suspendida';

export class Vm {
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
