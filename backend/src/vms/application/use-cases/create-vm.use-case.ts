import { Injectable, ConflictException } from '@nestjs/common';
import { VmRepository } from '../../domain/repositories/vm.repository.abstract';
import { CreateVmDto } from '../dtos/create-vm.dto';
import { Vm } from '../../domain/entities/vm.entity';

@Injectable()
export class CreateVmUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  async execute(dto: CreateVmDto): Promise<Vm> {
    const { data } = await this.vmRepository.findAll({ search: dto.name, limit: 100 });
    const nameExists = data.some((vm) => vm.name === dto.name);
    if (nameExists) {
      throw new ConflictException(`Ya existe una VM con el nombre "${dto.name}"`);
    }
    return this.vmRepository.create(dto as Partial<Vm>);
  }
}
