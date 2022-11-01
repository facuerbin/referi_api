import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Domicilio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  calle: string;

  @Column()
  numero: number;

  @Column({ default: ' ' })
  ciudad: string;

  @Column({ default: ' ' })
  provincia: string;
}
