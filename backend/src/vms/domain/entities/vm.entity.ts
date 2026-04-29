import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type VmStatus = 'Encendida' | 'Apagada' | 'Suspendida';

@Entity('vms')
export class Vm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  cores: number;

  @Column()
  ram: number;

  @Column()
  disk: number;

  @Column()
  os: string;

  @Column({ type: 'varchar', default: 'Apagada' })
  status: VmStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
