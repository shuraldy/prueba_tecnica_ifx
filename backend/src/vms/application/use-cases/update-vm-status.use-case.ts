import { Injectable, NotFoundException } from '@nestjs/common';
import { VmRepository } from '../../domain/repositories/vm.repository.abstract';
import { Vm, VmStatus } from '../../domain/entities/vm.entity';

@Injectable()
export class UpdateVmStatusUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  async execute(id: string, status: VmStatus): Promise<Vm> {
    const vm = await this.vmRepository.findById(id);
    if (!vm) throw new NotFoundException(`VM con id ${id} no encontrada`);
    return this.vmRepository.update(id, { status });
  }
}
