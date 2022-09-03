import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ActividadOrganizacion } from './actividad.organizacion.entity';

@Entity()
export class EstadoActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estado: string;

  @OneToMany(() => ActividadOrganizacion, (actividades) => actividades.estado)
  actividades: ActividadOrganizacion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
