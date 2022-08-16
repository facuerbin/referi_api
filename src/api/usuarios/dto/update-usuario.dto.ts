import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from '../entities/domicilio.entity';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  dni: number;

  @ApiProperty({ required: false })
  telefono: string;

  @ApiProperty()
  fechaNacimiento: Date;

  @ApiProperty({ required: false })
  fotoPerfil: string;

  @ApiProperty()
  domicilio: Domicilio;
}
