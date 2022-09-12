import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsInt, IsDateString } from 'class-validator';
import { Domicilio } from 'src/api/usuarios/entities/domicilio.entity';

export class RegisterDto {
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
  @IsDateString()
  fechaNacimiento: Date;

  @ApiProperty({ required: false })
  fotoPerfil: string;

  @ApiProperty({ type: Domicilio })
  domicilio: Domicilio;
}
