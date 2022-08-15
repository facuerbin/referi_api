import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { PlanillaAsistencia } from './planilla.asistencia.entity';
@Entity()
export class Asistente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hora: Date;

  @Column()
  legajo: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  dni: number;

  @ManyToOne(() => PlanillaAsistencia, (planilla) => planilla.asistentes)
  planilla: PlanillaAsistencia;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
