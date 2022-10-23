import { Pago } from 'src/api/pagos/entities/pago.entity';
import { Inscripcion } from 'src/api/socios/entities/inscripcion.entity';
import { PersonalOrganizacion } from 'src/api/organizaciones/entities/personal.organizacion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Domicilio } from './domicilio.entity';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  dni: number;

  @Column({ nullable: true })
  telefono: string;

  @Column({ default: false })
  verificado: boolean;

  @Column()
  fechaNacimiento: Date;

  @Column({ nullable: true })
  fotoPerfil: string;

  @OneToOne(() => Domicilio)
  @JoinColumn()
  domicilio: Domicilio;

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
}
