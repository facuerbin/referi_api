import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idRemitente: string;

  @Column()
  tipoDestinatario: Date;

  @Column()
  tipoRemitente: Tipo;

  @Column()
  titulo: Tipo;

  @Column()
  cuerpo: string;

  @Column()
  fecha: Date;
}

enum Tipo {
  SOCIO = 'Socio',
  ORGANIZACION = 'Organizacion',
  ADMINISTRADORSISTEMA = 'Administrador de Sistema',
  TODOS = 'Todos',
}
