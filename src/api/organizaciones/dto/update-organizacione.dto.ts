import { ApiProperty } from '@nestjs/swagger';
import { Domicilio } from 'src/api/usuarios/entities/domicilio.entity';

export class UpdateOrganizacionDto {
  @ApiProperty({ required: true })
  nombre: string;

  @ApiProperty({ required: true })
  direccion: Domicilio;

  @ApiProperty({ required: true })
  logo: string;

  @ApiProperty({ required: true })
  descripcion: string;

  @ApiProperty({ required: true })
  telefono: string;

  @ApiProperty({ required: true })
  email: string;
}
