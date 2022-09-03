import { ActividadOrganizacion } from 'src/api/actividades/entities/actividad.organizacion.entity';
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
} from 'typeorm';
import { Frecuencia } from './frecuencia.entity';
import { TarifaActividad } from './tarifa.actividad.entity';

@Entity()
export class Tarifa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  monto: number;

  @Column({ nullable: true })
  fechaDesde: Date;

  @Column({ nullable: true })
  fechaHasta: Date;

  @ManyToOne(() => Frecuencia, (frecuencia) => frecuencia.tarifas, {
    nullable: false,
  })
  frecuencia: Frecuencia;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.tarifas)
  organizacion: Organizacion;

  @OneToMany(() => TarifaActividad, (tarifaActividad) => tarifaActividad.tarifa)
  actividades: TarifaActividad[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
