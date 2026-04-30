import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vm_ram')
export class VmRamEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  value: number;
}
