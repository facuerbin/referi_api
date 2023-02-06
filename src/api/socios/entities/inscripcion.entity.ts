import { TurnoActividad } from 'src/api/actividades/entities/turno.actividad.entity';
import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import { Cuota } from 'src/api/pagos/entities/cuota.entity';
import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EstadoInscripcion } from './estado.inscripcion.entity';

@Entity()
export class Inscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.inscripciones)
  usuario: Usuario;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.socios)
  organizacion: Organizacion;

  @ManyToOne(
    () => TurnoActividad,
    (turnoActividad) => turnoActividad.inscriptos,
  )
  turnoActividad: TurnoActividad;

  @OneToMany(() => Cuota, (cuota) => cuota.inscripcion)
  cuotas: Cuota[];

  @ManyToMany(() => EstadoInscripcion)
  @JoinTable()
  estados: EstadoInscripcion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
