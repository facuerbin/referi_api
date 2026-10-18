import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class BajaActividadDto {
  @ApiProperty()
  @IsUUID()
  idSocio: string;

  @ApiProperty()
  @IsUUID()
  idActividad: string;

  @ApiProperty()
  @IsUUID()
  idOrganizacion: string;
}
