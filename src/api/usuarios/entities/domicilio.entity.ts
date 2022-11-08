import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Domicilio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  calle: string;

  @ApiProperty()
  @Column()
  numero: number;

  @ApiProperty()
  @Column({ default: ' ' })
  ciudad: string;

  @ApiProperty()
  @Column({ default: ' ' })
  provincia: string;
}
