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

  @Column()
  calle: string;

  @Column()
  numero: number;

  @Column()
  ciudad: string;

  @Column()
  provincia: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.domicilios)
  usuario: Usuario;
}
