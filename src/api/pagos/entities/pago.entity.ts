import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Cuota } from './cuota.entity';
@Entity()
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  monto: number;

  @Column()
  fechaPago: Date;

  @Column()
  numeroComprobante: string;

  @Column()
  medioDePago: MedioDePago;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.asistencias)
  organizacion: Organizacion;

  @OneToMany(() => Cuota, (cuota) => cuota.pago)
  cuotas: Cuota[];

  @ManyToOne(() => Usuario, (usuario) => usuario.pagos)
  usuario: Usuario;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}

enum MedioDePago {
  EFECTIVO = 'Efectivo',
  TRANSFERENCIA = 'Transferencia Bancaria',
  PASARELADEPAGOS = 'MercadoPago',
}
