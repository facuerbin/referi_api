import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  Unique,
  Column,
  JoinColumn,
} from 'typeorm';
import { Asistente } from './asistente.entity';

@Entity()
@Unique('fechaOrganizacion', ['fecha', 'organizacion'])
export class PlanillaAsistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fecha: Date;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.asistencias)
  @JoinColumn()
  organizacion: Organizacion;

  @OneToMany(() => Asistente, (asistente) => asistente.planilla)
  asistentes: Asistente[];
}
