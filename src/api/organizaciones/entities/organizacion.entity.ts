import { Actividad } from 'src/api/actividades/entities/actividad.entity';
import { PlanillaAsistencia } from 'src/api/asistencias/entities/planilla.asistencia.entity';
import { Pago } from 'src/api/pagos/entities/pago.entity';
import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import { Domicilio } from 'src/api/usuarios/entities/domicilio.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Espacio } from './espacio.entity';
import { InformacionPago } from './informacion.pago.entity';
import { PersonalOrganizacion } from './personal.organizacion.entity';
import { TipoOrganizacion } from './tipo.organizacion.entity';

@Entity()
export class Organizacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  logo: string; // url

  @Column()
  descripcion: string;

  @Column()
  telefono: string;

  @Column()
  email: string;

  @OneToOne(() => Domicilio)
  @JoinColumn()
  direccion: Domicilio;

  @ManyToOne(
    () => InformacionPago,
    (informacionPago) => informacionPago.organizaciones,
  )
  informacionPago: InformacionPago;

  @ManyToOne(
    () => TipoOrganizacion,
    (tipoOrganizacion) => tipoOrganizacion.organizaciones,
  )
  tipo: TipoOrganizacion;

  @OneToMany(() => Espacio, (espacio) => espacio.organizacion)
  espacios: Espacio[];

  @OneToMany(() => Actividad, (actividad) => actividad.organizacion)
  actividades: Actividad[];

  @OneToMany(
    () => PlanillaAsistencia,
    (asistencias) => asistencias.organizacion,
  )
  asistencias: PlanillaAsistencia[];

  @OneToMany(() => Pago, (pago) => pago.organizacion)
  pagos: Pago[];

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.organizacion)
  socios: Inscripcion[];

  @OneToMany(
    () => PersonalOrganizacion,
    (personalOrganizacion) => personalOrganizacion.personal,
  )
  empleados: PersonalOrganizacion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
