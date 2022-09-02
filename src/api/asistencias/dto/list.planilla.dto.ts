import { ApiProperty } from '@nestjs/swagger';

export class ListPlanillaDto {
  @ApiProperty()
  idOrg: string;

  @ApiProperty()
  fechaDesde: Date;

  @ApiProperty()
  fechaHasta: Date;
}
