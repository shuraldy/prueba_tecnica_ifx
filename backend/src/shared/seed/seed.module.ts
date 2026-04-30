import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AuthModule } from '../../auth/auth.module';
import { VmsModule } from '../../vms/vms.module';
import { VmResourcesModule } from '../../vm-resources/vm-resources.module';

@Module({
  imports: [AuthModule, VmsModule, VmResourcesModule],
  providers: [SeedService],
})
export class SeedModule {}
