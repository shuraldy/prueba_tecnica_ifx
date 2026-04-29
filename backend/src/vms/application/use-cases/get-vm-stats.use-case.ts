import { Injectable } from '@nestjs/common';
import { VmRepository, VmStats } from '../../domain/repositories/vm.repository.abstract';

@Injectable()
export class GetVmStatsUseCase {
  constructor(private readonly vmRepository: VmRepository) {}

  execute(): Promise<VmStats> {
    return this.vmRepository.getStats();
  }
}
