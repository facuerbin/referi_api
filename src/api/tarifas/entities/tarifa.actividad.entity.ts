import { Actividad } from 'src/api/actividades/entities/actividad.entity';
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

  @ManyToOne(() => Actividad, (actividad) => actividad.tarifas)
  actividad: Actividad;

  @OneToMany(() => Cuota, (cuota) => cuota.tarifa)
  cuotas: Cuota[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
