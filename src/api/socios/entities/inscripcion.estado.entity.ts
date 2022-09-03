import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { EstadoInscripcion } from './estado.inscripcion.entity';

@Entity()
export class InscripcionEstado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fechaDesde: Date;

  @Column()
  fechaHasta: Date;

  @ManyToOne(() => EstadoInscripcion, (estado) => estado.inscripcionEstado)
  estado: EstadoInscripcion;

  @ManyToOne(() => Inscripcion, (inscripcion) => inscripcion.cuotas)
  inscripcion: Inscripcion;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
