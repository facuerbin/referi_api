import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import { TarifaActividad } from 'src/api/tarifas/entities/tarifa.actividad.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Actividad } from './actividad.entity';
import { Horario } from './horario.entity';

@Entity()
export class ActividadOrganizacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cupo: number;

  @Column()
  descripcion: string;

  @Column()
  idOrganizacion: string;

  @ManyToOne(() => Actividad, (actividad) => actividad.turnos)
  actividad: Actividad;

  @ManyToMany(() => Horario)
  @JoinTable({ name: 'horario_actividad' })
  horarios: Horario[];

  @OneToMany(
    () => TarifaActividad,
    (tarifaActividad) => tarifaActividad.actividad,
  )
  tarifas: TarifaActividad[];

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.organizacion)
  inscriptos: Inscripcion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaDesde': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaHasta': Date;

  @Column({ default: true })
  isActive: boolean;
}
