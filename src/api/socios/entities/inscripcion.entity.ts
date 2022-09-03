import { ActividadOrganizacion } from 'src/api/actividades/entities/actividad.organizacion.entity';
import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import { Cuota } from 'src/api/pagos/entities/cuota.entity';
import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
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

@Entity()
export class Inscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  legajo: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.inscripciones)
  usuario: Usuario;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.socios)
  organizacion: Organizacion;

  @ManyToOne(() => ActividadOrganizacion, (actividad) => actividad.inscriptos)
  actividad: ActividadOrganizacion;

  @OneToMany(() => Cuota, (cuota) => cuota.inscripcion)
  cuotas: Cuota[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
