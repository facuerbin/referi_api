import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  CreateDateColumn,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { TurnoHorario } from './turno.horario.entity';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  diaSemana: Dias;

  @ApiProperty()
  @Column('integer')
  horaInicio: number;

  @ApiProperty()
  @Column('integer')
  minutosInicio: number;

  @ApiProperty()
  @Column()
  duracion: number; // en minutos

  @OneToMany(() => TurnoHorario, (turnos) => turnos.horario)
  turnos: TurnoHorario[];

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
