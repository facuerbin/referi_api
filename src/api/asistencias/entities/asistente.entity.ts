import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PlanillaAsistencia } from './planilla.asistencia.entity';
@Entity()
export class Asistente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('time')
  hora: Date;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  dni: number;

  @ManyToOne(() => PlanillaAsistencia, (planilla) => planilla.asistentes, {
    nullable: false,
  })
  planilla: PlanillaAsistencia;
}
