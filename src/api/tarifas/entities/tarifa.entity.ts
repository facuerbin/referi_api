import { Actividad } from 'src/api/actividades/entities/actividad.entity';
import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import { Cuota } from 'src/api/pagos/entities/cuota.entity';
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

@Entity()
export class Tarifa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  monto: number;

  @Column()
  esOpcional: boolean;

  @ManyToOne(() => Frecuencia, (frecuencia) => frecuencia.tarifas, {
    nullable: false,
  })
  frecuencia: Frecuencia;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.tarifas)
  organizacion: Organizacion;

  @ManyToOne(() => Actividad, (actividad) => actividad.tarifas)
  actividad: Actividad;

  @OneToMany(() => Cuota, (cuota) => cuota.tarifa)
  cuotas: Cuota[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
