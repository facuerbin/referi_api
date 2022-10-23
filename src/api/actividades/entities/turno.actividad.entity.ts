import { Espacio } from 'src/api/organizaciones/entities/espacio.entity';
import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import { TarifaActividad } from 'src/api/tarifas/entities/tarifa.actividad.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Actividad } from './actividad.entity';
import { EstadoActividad } from './estado.actividad.entity';
import { Horario } from './horario.entity';

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

  @ManyToMany(() => Horario)
  @JoinTable({ name: 'horario_actividad' })
  horarios: Horario[];

  @OneToMany(
    () => TarifaActividad,
    (tarifaActividad) => tarifaActividad.actividadOrganizacion,
    { cascade: ['insert', 'update'], lazy: true },
  )
  tarifas: TarifaActividad[];

  @OneToMany(() => Inscripcion, (inscriptos) => inscriptos.organizacion)
  inscriptos: Inscripcion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
