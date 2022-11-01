import { Espacio } from 'src/api/organizaciones/entities/espacio.entity';
import {
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Horario } from './horario.entity';
import { TurnoActividad } from './turno.actividad.entity';

@Entity()
export class TurnoHorario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Espacio, (espacio) => espacio.actividades)
  espacio: Espacio;

  @ManyToOne(() => Horario, (horario) => horario.turnos)
  horario: Horario;

  @ManyToOne(() => TurnoActividad, (turnoActividad) => turnoActividad.horarios)
  turnoActividad: TurnoActividad;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaDesde': Date;
}
