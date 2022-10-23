import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { TurnoActividad } from './turno.actividad.entity';

@Entity()
export class EstadoActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estado: string;

  @OneToMany(() => TurnoActividad, (actividades) => actividades.estado)
  actividades: TurnoActividad[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
