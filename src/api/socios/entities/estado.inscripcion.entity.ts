import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { InscripcionEstado } from './inscripcion.estado.entity';

@Entity()
export class EstadoInscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: Estado;

  @OneToMany(
    () => InscripcionEstado,
    (inscripcionEstado) => inscripcionEstado.estado,
  )
  inscripcionEstado: InscripcionEstado[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}

export enum Estado {
  ACTIVO = 'Activo',
  DEUDOR = 'Deudor',
  INACTIVO = 'Inactivo',
  BAJA = 'Baja',
}
