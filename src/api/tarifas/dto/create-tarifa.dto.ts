import { ApiProperty } from '@nestjs/swagger';

export class CreateTarifaDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  monto: number;

  @ApiProperty()
  nombreFrecuencia: string;

  @ApiProperty()
  idOrganizacion: string;
}
