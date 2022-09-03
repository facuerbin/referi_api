import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Actividad } from './actividad.entity';

@Entity()
export class TipoActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tipo: string;

  @Column()
  imgUrl: string;

  @OneToMany(() => Actividad, (actividad) => actividad.tipo)
  actividades: Actividad[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
