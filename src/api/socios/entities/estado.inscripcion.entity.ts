import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity()
export class EstadoInscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: Estado;

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
