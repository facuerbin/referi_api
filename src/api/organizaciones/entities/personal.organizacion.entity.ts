import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Organizacion } from './organizacion.entity';
import { Rol } from './rol.entity';

// Enum

@Entity()
export class PersonalOrganizacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organizacion, (organizacion) => organizacion.empleados)
  organizacion: Organizacion;

  @ManyToOne(() => Usuario, (usuario) => usuario.organizaciones)
  personal: Usuario;

  @ManyToOne(() => Rol, (rol) => rol.empleados)
  rol: Rol;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
