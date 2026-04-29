import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './domain/repositories/user.repository.abstract';
import { UserTypeOrmRepository } from './infrastructure/repositories/user.typeorm.repository';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { AuthController } from './infrastructure/controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const expiration = config.get('JWT_EXPIRATION', '1d');
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: { expiresIn: expiration as '1d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    { provide: UserRepository, useClass: UserTypeOrmRepository },
  ],
  exports: [UserRepository, JwtModule, PassportModule],
})
export class AuthModule {}
