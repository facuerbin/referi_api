import { TurnoHorario } from 'src/api/actividades/entities/turno.horario.entity';
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

  @OneToMany(() => TurnoHorario, (turno) => turno.espacio)
  actividades: TurnoHorario;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
