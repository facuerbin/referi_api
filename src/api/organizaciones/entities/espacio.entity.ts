import { ActividadOrganizacion } from 'src/api/actividades/entities/actividad.organizacion.entity';
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
import { Organizacion } from './organizacion.entity';

@Entity()
export class Espacio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  capacidad: number;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.espacios)
  organizacion: Organizacion;

  @OneToMany(() => ActividadOrganizacion, (actividades) => actividades.espacio)
  actividades: ActividadOrganizacion;
  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
