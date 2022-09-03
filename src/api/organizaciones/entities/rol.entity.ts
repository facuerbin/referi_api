import { PersonalOrganizacion } from 'src/api/organizaciones/entities/personal.organizacion.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permiso } from './permiso.entity';

@Entity()
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  descripcion: string;

  @OneToMany(
    () => PersonalOrganizacion,
    (personalOrganizacion) => personalOrganizacion.rol,
  )
  empleados: PersonalOrganizacion[];

  @ManyToMany(() => Permiso)
  @JoinTable({ name: 'permiso_rol' })
  permisos: Permiso[];

  // Timestampsp
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
