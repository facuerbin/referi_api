import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ActividadOrganizacion } from './actividad.organizacion.entity';

@Entity()
export class EstadoActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  estado: string;

  @OneToMany(() => ActividadOrganizacion, (actividades) => actividades.estado)
  actividades: ActividadOrganizacion[];

  @Column({ default: true })
  isActive: boolean;
}
