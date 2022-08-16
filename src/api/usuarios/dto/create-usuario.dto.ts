import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsInt, IsDate, MaxDate } from 'class-validator';
import { Domicilio } from '../entities/domicilio.entity';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty()
  @IsInt()
  dni: number;

  @ApiProperty({ required: false })
  telefono: string;

  @ApiProperty()
  @IsDate()
  fechaNacimiento: Date;

  @ApiProperty({ required: false })
  fotoPerfil: string;

  @ApiProperty()
  domicilio: Domicilio;
}
