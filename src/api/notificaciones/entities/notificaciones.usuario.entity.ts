import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Notificacion } from './notificacion.entity';

@Entity()
export class NotificacionUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, (destinatario) => destinatario.notificaciones)
  destinatario: Usuario;

  @ManyToOne(() => Notificacion, (notificacion) => notificacion.detinatarios)
  notificacion: Notificacion;

  @Column()
  fechaLectura: Date;
}
