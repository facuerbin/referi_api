import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombreArchivo: string;

  @Column()
  programado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' }) 'fechaCreacion': Date;
  @DeleteDateColumn({ name: 'fecha_baja' }) 'fechaBaja': Date;
}
