import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

  @Column({ default: true })
  isActive: boolean;
}
