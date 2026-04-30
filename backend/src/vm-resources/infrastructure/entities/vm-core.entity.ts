import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vm_cores')
export class VmCoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  value: number;
}
