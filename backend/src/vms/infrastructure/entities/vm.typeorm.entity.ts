import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import type { VmStatus } from '../../domain/entities/vm.entity';
import { VmCoreEntity } from '../../../vm-resources/infrastructure/entities/vm-core.entity';
import { VmRamEntity }  from '../../../vm-resources/infrastructure/entities/vm-ram.entity';
import { VmDiskEntity } from '../../../vm-resources/infrastructure/entities/vm-disk.entity';
import { VmOsEntity }   from '../../../vm-resources/infrastructure/entities/vm-os.entity';

@Entity('vms')
export class VmTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => VmCoreEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'core_id' })
  core: VmCoreEntity;

  @ManyToOne(() => VmRamEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'ram_id' })
  ram: VmRamEntity;

  @ManyToOne(() => VmDiskEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'disk_id' })
  disk: VmDiskEntity;

  @ManyToOne(() => VmOsEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'os_id' })
  os: VmOsEntity;

  @Column({ type: 'varchar', default: 'Apagada' })
  status: VmStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
