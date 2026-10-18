import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class ListPlanillaDto {
  @ApiProperty()
  @IsUUID()
  idOrg: string;

  @ApiProperty()
  @IsDateString()
  fechaDesde: Date;

  @ApiProperty()
  @IsDateString()
  fechaHasta: Date;
}
