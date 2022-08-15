import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import { TarifaActividad } from 'src/api/tarifas/entities/tarifa.actividad.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Pago } from './pago.entity';

@Entity()
export class Cuota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  monto: number;

  @Column()
  fechaVencimiento: Date;

  @ManyToOne(() => Pago, (pago) => pago.cuotas)
  pago: Pago;

  @ManyToOne(() => TarifaActividad, (tarifa) => tarifa.cuotas)
  tarifa: TarifaActividad;

  @ManyToOne(() => Inscripcion, (inscripcion) => inscripcion.cuotas)
  inscripcion: Inscripcion;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
