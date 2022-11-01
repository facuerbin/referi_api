import { Espacio } from 'src/api/organizaciones/entities/espacio.entity';
import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Actividad } from './actividad.entity';
import { EstadoActividad } from './estado.actividad.entity';

import { TurnoHorario } from './turno.horario.entity';

@Entity()
export class TurnoActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Actividad, (actividad) => actividad.turnos)
  actividad: Actividad;

  @ManyToOne(() => Espacio, (espacio) => espacio.actividades)
  espacio: Espacio;

  @ManyToOne(() => EstadoActividad, (estado) => estado.actividades)
  estado: EstadoActividad;

  @OneToMany(() => TurnoHorario, (horario) => horario.turnoActividad)
  horarios: TurnoHorario[];

  @OneToMany(() => Inscripcion, (inscriptos) => inscriptos.organizacion)
  inscriptos: Inscripcion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
