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
import { TipoActividad } from './tipo.actividad.entity';

@Entity()
export class Actividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column()
  imgUrl: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.actividades)
  organizacion: Organizacion;

  @ManyToOne(() => TipoActividad, (tipo) => tipo.actividades)
  tipo: TipoActividad;

  @OneToMany(() => ActividadOrganizacion, (turnos) => turnos.actividad)
  turnos: ActividadOrganizacion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
