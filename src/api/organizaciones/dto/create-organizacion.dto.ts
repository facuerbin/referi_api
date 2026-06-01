import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from 'src/api/usuarios/entities/domicilio.entity';

export class CreateOrganizacionDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  direccion: Domicilio;

  @ApiProperty()
  tipoOrganizacion: string;

  @ApiProperty()
  logo: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  telefono: string;

  @ApiProperty()
  email: string;
}
