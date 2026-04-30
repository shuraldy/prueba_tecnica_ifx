import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vm_os')
export class VmOsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: false })
  isCustom: boolean;
}
