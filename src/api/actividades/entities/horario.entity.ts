import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Horario {
  @PrimaryColumn()
  diaSemana: Dias;

  @PrimaryColumn()
  horaInicio: string;

  @PrimaryColumn()
  duracion: number; // en minutos

  @Column()
  idOrganizacion: string;

  // Timestamps
  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaDesde': Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion' }) 'fechaActualizacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaHasta': Date;

  @Column({ default: true })
  isActive: boolean;
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
