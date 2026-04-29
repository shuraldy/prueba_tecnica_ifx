import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vm } from './domain/entities/vm.entity';
import { VmRepository } from './domain/repositories/vm.repository.abstract';
import { VmTypeOrmRepository } from './infrastructure/repositories/vm.typeorm.repository';
import { ListVmsUseCase } from './application/use-cases/list-vms.use-case';
import { GetVmByIdUseCase } from './application/use-cases/get-vm-by-id.use-case';
import { GetVmStatsUseCase } from './application/use-cases/get-vm-stats.use-case';
import { CreateVmUseCase } from './application/use-cases/create-vm.use-case';
import { UpdateVmUseCase } from './application/use-cases/update-vm.use-case';
import { UpdateVmStatusUseCase } from './application/use-cases/update-vm-status.use-case';
import { DeleteVmUseCase } from './application/use-cases/delete-vm.use-case';
import { VmsController } from './infrastructure/controllers/vms.controller';
import { VmsGateway } from './infrastructure/gateways/vms.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vm]), AuthModule],
  controllers: [VmsController],
  providers: [
    VmsGateway,
    ListVmsUseCase,
    GetVmByIdUseCase,
    GetVmStatsUseCase,
    CreateVmUseCase,
    UpdateVmUseCase,
    UpdateVmStatusUseCase,
    DeleteVmUseCase,
    { provide: VmRepository, useClass: VmTypeOrmRepository },
  ],
  exports: [VmRepository],
})
export class VmsModule {}
