import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NotificacionUsuario } from './notificaciones.usuario.entity';

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

  @OneToMany(
    () => NotificacionUsuario,
    (notificacionUsuario) => notificacionUsuario.notificacion,
  )
  destinatarios: NotificacionUsuario[];
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
