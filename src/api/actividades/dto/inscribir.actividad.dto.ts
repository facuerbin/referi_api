import { ApiProperty } from '@nestjs/swagger';

export class InscribirActividadDto {
  @ApiProperty()
  idSocio: string;

  @ApiProperty()
  idActividad: string;

  @ApiProperty()
  idOrganizacion: string;
}
