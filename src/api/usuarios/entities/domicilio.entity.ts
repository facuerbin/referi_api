import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity()
export class Domicilio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  calle: string;

  numero: number;

  ciudad: string;

  provincia: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.domicilios)
  usuario: Usuario;
}
