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
import { ActividadOrganizacion } from './actividad.organizacion.entity';

@Entity()
export class Actividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  idOrganizacion: string;

  @OneToMany(() => ActividadOrganizacion, (turno) => turno.actividad)
  turnos: ActividadOrganizacion[];

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.actividades)
  organizacion: Organizacion;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
