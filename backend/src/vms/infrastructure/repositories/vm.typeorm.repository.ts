import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vm } from '../../domain/entities/vm.entity';
import { VmRepository, VmsFilter, PaginatedVms, VmStats } from '../../domain/repositories/vm.repository.abstract';

@Injectable()
export class VmTypeOrmRepository implements VmRepository {
  constructor(
    @InjectRepository(Vm)
    private readonly repo: Repository<Vm>,
  ) {}

  async findAll(filter: VmsFilter = {}): Promise<PaginatedVms> {
    const { status, search, page = 1, limit = 10 } = filter;

    const qb = this.repo.createQueryBuilder('vm').orderBy('vm.createdAt', 'DESC');

    if (status) {
      qb.andWhere('vm.status = :status', { status });
    }

    if (search) {
      qb.andWhere('(LOWER(vm.name) LIKE :search OR LOWER(vm.os) LIKE :search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string): Promise<Vm | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getStats(): Promise<VmStats> {
    const vms = await this.repo.find();

    const byStatus = { Encendida: 0, Apagada: 0, Suspendida: 0 };
    let totalCores = 0;
    let totalRam = 0;
    let totalDisk = 0;

    for (const vm of vms) {
      byStatus[vm.status] = (byStatus[vm.status] ?? 0) + 1;
      totalCores += vm.cores;
      totalRam += vm.ram;
      totalDisk += vm.disk;
    }

    return { totalVms: vms.length, byStatus, totalCores, totalRam, totalDisk };
  }

  create(vm: Partial<Vm>): Promise<Vm> {
    const entity = this.repo.create(vm);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Vm>): Promise<Vm> {
    const vm = await this.findById(id);
    if (!vm) throw new NotFoundException(`VM con id ${id} no encontrada`);
    Object.assign(vm, data);
    return this.repo.save(vm);
  }

  async delete(id: string): Promise<void> {
    const vm = await this.findById(id);
    if (!vm) throw new NotFoundException(`VM con id ${id} no encontrada`);
    await this.repo.remove(vm);
  }
}
