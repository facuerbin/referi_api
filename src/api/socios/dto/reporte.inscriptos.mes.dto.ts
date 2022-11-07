import { ApiProperty } from '@nestjs/swagger';

export class ReporteInscriptosMesDto {
  @ApiProperty()
  idOrganizacion: string;

  @ApiProperty()
  fromYear: number;

  @ApiProperty()
  fromMonth: number;

  @ApiProperty()
  toYear: number;

  @ApiProperty()
  toMonth: number;
}
