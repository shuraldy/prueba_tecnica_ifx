import { Injectable } from '@nestjs/common';
import { VmRepository } from '../../domain/repositories/vm.repository.abstract';

@Injectable()
export class DeleteVmUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  execute(id: string): Promise<void> {
    return this.vmRepository.delete(id);
  }
}
