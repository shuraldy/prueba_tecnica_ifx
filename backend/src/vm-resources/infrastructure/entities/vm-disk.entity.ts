import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vm_disk')
export class VmDiskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  value: number;
}
