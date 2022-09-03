import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { InscriptoEstado } from './inscripto.estado.entity';

@Entity()
export class EstadoInscripto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: Estado;

  @OneToMany(() => InscriptoEstado, (inscriptoEstado) => inscriptoEstado.estado)
  inscriptoEstado: InscriptoEstado[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}

enum Estado {
  ACTIVO = 'Activo',
  DEUDOR = 'Deudor',
  INACTIVO = 'Inactivo',
  BAJA = 'Baja',
}
