import { Organizacion } from './../../organizaciones/entities/organizacion.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { TurnoActividad } from './turno.actividad.entity';
import { TipoActividad } from './tipo.actividad.entity';
import { TarifaActividad } from 'src/api/tarifas/entities/tarifa.actividad.entity';

@Entity()
export class Actividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  cupo: number;

  @Column()
  imgUrl: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.actividades)
  organizacion: Organizacion;

  @ManyToOne(() => TipoActividad, (tipo) => tipo.actividades)
  tipo: TipoActividad;

  @OneToMany(() => TurnoActividad, (turnos) => turnos.actividad)
  turnos: TurnoActividad[];

  @OneToMany(
    () => TarifaActividad,
    (tarifaActividad) => tarifaActividad.actividad,
    { cascade: ['insert', 'update'], lazy: true },
  )
  tarifas: TarifaActividad[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
