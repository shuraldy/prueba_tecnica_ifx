import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vm } from '../../domain/entities/vm.entity';
import { VmRepository, VmsFilter, PaginatedVms, VmStats } from '../../domain/repositories/vm.repository.abstract';
import { VmTypeOrmEntity } from '../entities/vm.typeorm.entity';
import { VmCoreEntity } from '../../../vm-resources/infrastructure/entities/vm-core.entity';
import { VmRamEntity }  from '../../../vm-resources/infrastructure/entities/vm-ram.entity';
import { VmDiskEntity } from '../../../vm-resources/infrastructure/entities/vm-disk.entity';
import { VmOsEntity }   from '../../../vm-resources/infrastructure/entities/vm-os.entity';

@Injectable()
export class VmTypeOrmRepository implements VmRepository {
  constructor(
    @InjectRepository(VmTypeOrmEntity) private readonly repo:     Repository<VmTypeOrmEntity>,
    @InjectRepository(VmCoreEntity)    private readonly coreRepo: Repository<VmCoreEntity>,
    @InjectRepository(VmRamEntity)     private readonly ramRepo:  Repository<VmRamEntity>,
    @InjectRepository(VmDiskEntity)    private readonly diskRepo: Repository<VmDiskEntity>,
    @InjectRepository(VmOsEntity)      private readonly osRepo:   Repository<VmOsEntity>,
  ) {}

  private toDomain(e: VmTypeOrmEntity): Vm {
    const vm = new Vm();
    vm.id        = e.id;
    vm.name      = e.name;
    vm.cores     = e.core?.value ?? 0;
    vm.ram       = e.ram?.value  ?? 0;
    vm.disk      = e.disk?.value ?? 0;
    vm.os        = e.os?.name    ?? '';
    vm.status    = e.status;
    vm.createdAt = e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt);
    vm.updatedAt = e.updatedAt instanceof Date ? e.updatedAt.toISOString() : String(e.updatedAt);
    return vm;
  }

  private async resolveRefs(data: Partial<Vm>) {
    const [core, ram, disk, os] = await Promise.all([
      data.cores !== undefined ? this.coreRepo.findOne({ where: { value: data.cores } }) : Promise.resolve(undefined),
      data.ram   !== undefined ? this.ramRepo.findOne({ where: { value: data.ram } })   : Promise.resolve(undefined),
      data.disk  !== undefined ? this.diskRepo.findOne({ where: { value: data.disk } }) : Promise.resolve(undefined),
      data.os    !== undefined ? this.osRepo.findOne({ where: { name: data.os } })       : Promise.resolve(undefined),
    ]);
    if (data.cores !== undefined && !core) throw new BadRequestException(`Opción de vCPU no válida: ${data.cores}`);
    if (data.ram   !== undefined && !ram)  throw new BadRequestException(`Opción de RAM no válida: ${data.ram}`);
    if (data.disk  !== undefined && !disk) throw new BadRequestException(`Opción de disco no válida: ${data.disk}`);
    if (data.os    !== undefined && !os)   throw new BadRequestException(`Sistema operativo no encontrado: "${data.os}"`);
    return { core, ram, disk, os };
  }

  async findAll(filter: VmsFilter = {}): Promise<PaginatedVms> {
    const { status, search, page = 1, limit = 10 } = filter;

    const qb = this.repo.createQueryBuilder('vm')
      .leftJoinAndSelect('vm.core', 'core')
      .leftJoinAndSelect('vm.ram',  'ram')
      .leftJoinAndSelect('vm.disk', 'disk')
      .leftJoinAndSelect('vm.os',   'os')
      .orderBy('vm.createdAt', 'DESC');

    if (status) qb.andWhere('vm.status = :status', { status });
    if (search) {
      qb.andWhere('(LOWER(vm.name) LIKE :q OR LOWER(os.name) LIKE :q)', {
        q: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const data  = await qb.skip((page - 1) * limit).take(limit).getMany();

    return { data: data.map(e => this.toDomain(e)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Vm | null> {
    const e = await this.repo.findOne({ where: { id } });
    return e ? this.toDomain(e) : null;
  }

  async getStats(): Promise<VmStats> {
    const all = await this.repo.find();
    const byStatus = { Encendida: 0, Apagada: 0, Suspendida: 0 };
    let totalCores = 0, totalRam = 0, totalDisk = 0;
    for (const e of all) {
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
      totalCores += e.core?.value ?? 0;
      totalRam   += e.ram?.value  ?? 0;
      totalDisk  += e.disk?.value ?? 0;
    }
    return { totalVms: all.length, byStatus, totalCores, totalRam, totalDisk };
  }

  async create(data: Partial<Vm>): Promise<Vm> {
    const refs = await this.resolveRefs(data);
    const entity = new VmTypeOrmEntity();
    entity.name   = data.name!;
    entity.core   = refs.core!;
    entity.ram    = refs.ram!;
    entity.disk   = refs.disk!;
    entity.os     = refs.os!;
    entity.status = data.status!;
    return this.toDomain(await this.repo.save(entity));
  }

  async update(id: string, data: Partial<Vm>): Promise<Vm> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`VM con id ${id} no encontrada`);
    const refs = await this.resolveRefs(data);
    if (data.name)   entity.name   = data.name;
    if (data.status) entity.status = data.status;
    if (refs.core)   entity.core   = refs.core;
    if (refs.ram)    entity.ram    = refs.ram;
    if (refs.disk)   entity.disk   = refs.disk;
    if (refs.os)     entity.os     = refs.os;
    return this.toDomain(await this.repo.save(entity));
  }

  async delete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`VM con id ${id} no encontrada`);
    await this.repo.remove(entity);
  }
}
