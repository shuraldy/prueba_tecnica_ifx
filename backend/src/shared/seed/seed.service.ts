import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../auth/domain/repositories/user.repository.abstract';
import { VmRepository } from '../../vms/domain/repositories/vm.repository.abstract';
import { VmCoreEntity } from '../../vm-resources/infrastructure/entities/vm-core.entity';
import { VmRamEntity }  from '../../vm-resources/infrastructure/entities/vm-ram.entity';
import { VmDiskEntity } from '../../vm-resources/infrastructure/entities/vm-disk.entity';
import { VmOsEntity }   from '../../vm-resources/infrastructure/entities/vm-os.entity';

const CORE_VALUES = [2, 4, 8, 16, 32, 64, 128];
const RAM_VALUES  = [2048, 4096, 8192, 16384, 32768, 65536];
const DISK_VALUES = [10, 20, 50, 100, 200, 500, 1000, 2000];
const OS_NAMES = [
  'Ubuntu 24.04 LTS',
  'Ubuntu 22.04 LTS',
  'Ubuntu 20.04 LTS',
  'Debian 12 (Bookworm)',
  'Debian 11 (Bullseye)',
  'CentOS Stream 9',
  'Rocky Linux 9',
  'AlmaLinux 9',
  'Red Hat Enterprise Linux 9',
  'Fedora 40',
  'Windows Server 2022',
  'Windows Server 2019',
  'Windows Server 2016',
  'openSUSE Leap 15.5',
  'Alpine Linux 3.19',
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly vmRepository: VmRepository,
    @InjectRepository(VmCoreEntity) private readonly coreRepo: Repository<VmCoreEntity>,
    @InjectRepository(VmRamEntity)  private readonly ramRepo:  Repository<VmRamEntity>,
    @InjectRepository(VmDiskEntity) private readonly diskRepo: Repository<VmDiskEntity>,
    @InjectRepository(VmOsEntity)   private readonly osRepo:   Repository<VmOsEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedResources();
    await this.seedVms();
  }

  private async seedUsers() {
    const users = await this.userRepository.findAll();
    if (users.length > 0) return;
    const hash = (pw: string) => bcrypt.hash(pw, 10);
    await this.userRepository.save({ name: 'Admin Principal', email: 'admin@ifx.com', password: await hash('Admin123!'), role: 'Administrador' as const });
    await this.userRepository.save({ name: 'Cliente Demo', email: 'cliente@ifx.com', password: await hash('Cliente123!'), role: 'Cliente' as const });
  }

  private async seedResources() {
    const [coreCount, ramCount, diskCount, osCount] = await Promise.all([
      this.coreRepo.count(),
      this.ramRepo.count(),
      this.diskRepo.count(),
      this.osRepo.count(),
    ]);

    if (coreCount === 0) {
      await this.coreRepo.save(CORE_VALUES.map(value => this.coreRepo.create({ value })));
    }
    if (ramCount === 0) {
      await this.ramRepo.save(RAM_VALUES.map(value => this.ramRepo.create({ value })));
    }
    if (diskCount === 0) {
      await this.diskRepo.save(DISK_VALUES.map(value => this.diskRepo.create({ value })));
    }
    if (osCount === 0) {
      await this.osRepo.save(OS_NAMES.map(name => this.osRepo.create({ name, isCustom: false })));
    }
  }

  private async seedVms() {
    const { total } = await this.vmRepository.findAll();
    if (total > 0) return;

    const seedData = [
      { name: 'web-server-01',   cores: 4,  ram: 8192,  disk: 100, os: 'Ubuntu 22.04 LTS',     status: 'Encendida'  as const },
      { name: 'db-server-01',    cores: 8,  ram: 16384, disk: 500, os: 'Rocky Linux 9',         status: 'Encendida'  as const },
      { name: 'cache-server-01', cores: 2,  ram: 4096,  disk: 50,  os: 'Debian 11 (Bullseye)',  status: 'Apagada'    as const },
      { name: 'worker-node-01',  cores: 4,  ram: 8192,  disk: 200, os: 'Ubuntu 22.04 LTS',      status: 'Suspendida' as const },
      { name: 'monitoring-01',   cores: 2,  ram: 2048,  disk: 20,  os: 'Alpine Linux 3.19',     status: 'Encendida'  as const },
      { name: 'api-gateway-01',  cores: 4,  ram: 4096,  disk: 50,  os: 'Ubuntu 24.04 LTS',      status: 'Encendida'  as const },
    ];

    for (const vm of seedData) {
      await this.vmRepository.create(vm);
    }
  }
}
