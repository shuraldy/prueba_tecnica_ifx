import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VmCoreEntity } from './infrastructure/entities/vm-core.entity';
import { VmRamEntity } from './infrastructure/entities/vm-ram.entity';
import { VmDiskEntity } from './infrastructure/entities/vm-disk.entity';
import { VmOsEntity } from './infrastructure/entities/vm-os.entity';
import { VmResourcesController } from './infrastructure/controllers/vm-resources.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VmCoreEntity, VmRamEntity, VmDiskEntity, VmOsEntity]),
    AuthModule,
  ],
  controllers: [VmResourcesController],
  exports: [TypeOrmModule],
})
export class VmResourcesModule {}
