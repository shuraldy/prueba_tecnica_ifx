import { Injectable } from '@nestjs/common';
import { VmRepository } from '../../domain/repositories/vm.repository.abstract';
import { UpdateVmDto } from '../dtos/update-vm.dto';
import { Vm } from '../../domain/entities/vm.entity';

@Injectable()
export class UpdateVmUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  execute(id: string, dto: UpdateVmDto): Promise<Vm> {
    return this.vmRepository.update(id, dto as Partial<Vm>);
  }
}
