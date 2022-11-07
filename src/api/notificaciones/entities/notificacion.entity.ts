import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idRemitente: string;

  @Column()
  nombreRemitente: string;

  @Column()
  tipoRemitente: TipoRemitente;

  @Column()
  tipoDestinatario: TipoDestinatario;

  @Column()
  titulo: string;

  @Column()
  cuerpo: string;

  @Column()
  fecha: Date;

  @ManyToMany(() => Usuario)
  @JoinTable({ name: 'notificaciones_usuario' })
  usuarios: Usuario[];
}

export enum TipoRemitente {
  SOCIO = 'Socio',
  ORGANIZACION = 'Organizacion',
  ADMINISTRADORSISTEMA = 'Administrador de Sistema',
  TODOS = 'Todos',
}

export enum TipoDestinatario {
  DEUDORES = 'Deudores',
  SOCIOS = 'Socios',
  ACTIVIDAD = 'Inscriptos a Actividad',
  TURNO_ACTIVIDAD = 'Inscriptos a un Turno',
  PERSONAL_ORGANIZACION = 'Personal Organización',
  SOCIO = 'Socio',
}
