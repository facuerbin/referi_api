import { ActividadOrganizacion } from 'src/api/actividades/entities/actividad.organizacion.entity';
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
    () => ActividadOrganizacion,
    (actividadOrganizacion) => actividadOrganizacion.tarifas,
  )
  actividadOrganizacion: ActividadOrganizacion;

  @OneToMany(() => Cuota, (cuota) => cuota.tarifa)
  cuotas: Cuota[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
