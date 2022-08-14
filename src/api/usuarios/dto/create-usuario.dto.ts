import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from '../entities/domicilio.entity';

export class CreateUsuarioDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  dni: string;

  @ApiProperty({ required: false })
  telefono: string;

  @ApiProperty()
  fechaNacimiento: string;

  @ApiProperty({ required: false })
  fotoPerfil: string;

  @ApiProperty()
  domicilio: Domicilio;
}
