import { Injectable, NotFoundException } from '@nestjs/common';
import { VmRepository } from '../../domain/repositories/vm.repository.abstract';
import { Vm } from '../../domain/entities/vm.entity';

@Injectable()
export class GetVmByIdUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  async execute(id: string): Promise<Vm> {
    const vm = await this.vmRepository.findById(id);
    if (!vm) throw new NotFoundException(`VM con id ${id} no encontrada`);
    return vm;
  }
}
