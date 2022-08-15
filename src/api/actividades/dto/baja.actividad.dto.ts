import { ApiProperty } from '@nestjs/swagger';

export class BajaActividadDto {
  @ApiProperty()
  idSocio: string;

  @ApiProperty()
  idActividad: string;

  @ApiProperty()
  idOrganizacion: string;
}
