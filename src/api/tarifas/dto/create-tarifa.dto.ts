import { ApiProperty } from '@nestjs/swagger';

export class CreateTarifaDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  monto: number;

  @ApiProperty()
  esOpcional: boolean;

  @ApiProperty()
  nombreFrecuencia: string;

  @ApiProperty()
  idOrganizacion: string;

  @ApiProperty()
  idActividad: string;
}
