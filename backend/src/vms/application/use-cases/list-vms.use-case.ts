import { Injectable } from '@nestjs/common';
import { VmRepository, PaginatedVms, VmsFilter } from '../../domain/repositories/vm.repository.abstract';

@Injectable()
export class ListVmsUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  execute(filter?: VmsFilter): Promise<PaginatedVms> {
    return this.vmRepository.findAll(filter);
  }
}
