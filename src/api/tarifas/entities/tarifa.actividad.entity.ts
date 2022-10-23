import { TurnoActividad } from 'src/api/actividades/entities/turno.actividad.entity';
import { Cuota } from 'src/api/pagos/entities/cuota.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Tarifa } from './tarifa.entity';

@Entity()
export class TarifaActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tarifa, (tarifa) => tarifa.actividades)
  tarifa: Tarifa;

  @ManyToOne(
    () => TurnoActividad,
    (actividadOrganizacion) => actividadOrganizacion.tarifas,
  )
  actividadOrganizacion: TurnoActividad;

  @OneToMany(() => Cuota, (cuota) => cuota.tarifa)
  cuotas: Cuota[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
