import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Domicilio } from './domicilio.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  dni: string;

  @Column()
  telefono: string;

  @Column()
  fechaNacimiento: string;

  @Column()
  fotoPerfil: string;

  @OneToMany(() => Domicilio, (domicilio) => domicilio.usuario)
  domicilios: Domicilio[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
