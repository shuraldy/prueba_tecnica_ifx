import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../auth/domain/repositories/user.repository.abstract';
import { VmRepository } from '../../vms/domain/repositories/vm.repository.abstract';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly vmRepository: VmRepository,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedVms();
  }

  private async seedUsers() {
    const users = await this.userRepository.findAll();
    if (users.length > 0) return;

    const hash = (pw: string) => bcrypt.hash(pw, 10);

    await this.userRepository.save({
      name: 'Admin Principal',
      email: 'admin@ifx.com',
      password: await hash('Admin123!'),
      role: 'Administrador' as const,
    });

    await this.userRepository.save({
      name: 'Cliente Demo',
      email: 'cliente@ifx.com',
      password: await hash('Cliente123!'),
      role: 'Cliente' as const,
    });
  }

  private async seedVms() {
    const { total } = await this.vmRepository.findAll();
    if (total > 0) return;

    const seedData = [
      { name: 'web-server-01', cores: 4, ram: 8192, disk: 100, os: 'Ubuntu 22.04', status: 'Encendida' as const },
      { name: 'db-server-01', cores: 8, ram: 16384, disk: 500, os: 'CentOS 8', status: 'Encendida' as const },
      { name: 'cache-server-01', cores: 2, ram: 4096, disk: 50, os: 'Debian 11', status: 'Apagada' as const },
      { name: 'worker-node-01', cores: 4, ram: 8192, disk: 200, os: 'Ubuntu 22.04', status: 'Suspendida' as const },
      { name: 'monitoring-01', cores: 2, ram: 2048, disk: 80, os: 'Alpine Linux', status: 'Encendida' as const },
    ];

    for (const vm of seedData) {
      await this.vmRepository.create(vm);
    }
  }
}
