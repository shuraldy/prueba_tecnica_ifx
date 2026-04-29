import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AuthModule } from '../../auth/auth.module';
import { VmsModule } from '../../vms/vms.module';

@Module({
  imports: [AuthModule, VmsModule],
  providers: [SeedService],
})
export class SeedModule {}
