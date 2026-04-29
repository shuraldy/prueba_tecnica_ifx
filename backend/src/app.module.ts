import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { VmsModule } from './vms/vms.module';
import { SeedModule } from './shared/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('DB_PATH', './database.sqlite'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    AuthModule,
    VmsModule,
    SeedModule,
  ],
})
export class AppModule {}
