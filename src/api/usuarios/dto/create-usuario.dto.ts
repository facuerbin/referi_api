import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from '../entities/domicilio.entity';

export class CreateUsuarioDto {
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
