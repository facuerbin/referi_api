import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
} from 'typeorm';
import { Inscripcion } from './inscripcion.entity';

@Entity()
export class EstadoInscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: Estado;

  @ManyToMany(() => Inscripcion, (inscripcion) => inscripcion.estados)
  inscriptos: Inscripcion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}

export enum Estado {
  ACTIVO = 'ACTIVO',
  DEUDOR = 'DEUDOR',
  INACTIVO = 'INACTIVO',
  BAJA = 'BAJA',
}
