import {
  Entity,
  CreateDateColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  diaSemana: Dias;

  @Column('integer')
  horaInicio: number;

  @Column('integer')
  minutosInicio: number;

  @Column()
  duracion: number; // en minutos

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaDesde': Date;
}

export enum Dias {
  LUNES = 'Lunes',
  MARTES = 'Martes',
  MIERCOLES = 'Miércoles',
  JUEVES = 'Jueves',
  VIERNES = 'Viernes',
  SABADO = 'Sábado',
  DOMINGO = 'Domingo',
}
