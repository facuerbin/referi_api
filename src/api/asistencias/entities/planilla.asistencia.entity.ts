import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Asistente } from './asistente.entity';

@Entity()
export class PlanillaAsistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @PrimaryColumn()
  fecha: Date;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.asistencias)
  organizacion: Organizacion;

  @OneToMany(() => Asistente, (asistente) => asistente.planilla)
  asistentes: Asistente[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
