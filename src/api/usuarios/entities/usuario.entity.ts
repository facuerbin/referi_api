import { Organizacion } from 'src/api/organizaciones/entities/organizacion.entity';
import { PersonalOrganizacion } from 'src/api/organizaciones/entities/personal.organizacion.entity';
import { Pago } from 'src/api/pagos/entities/pago.entity';
import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
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

  @OneToMany(() => Pago, (pago) => pago.usuario)
  pagos: Pago[];

  @OneToMany(() => Inscripcion, (inscripcion) => inscripcion.usuario)
  inscripciones: Inscripcion[];

  @OneToMany(
    () => PersonalOrganizacion,
    (organizaciones) => organizaciones.personal,
  )
  organizaciones: PersonalOrganizacion[];

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;

  @Column({ default: true })
  isActive: boolean;
}
