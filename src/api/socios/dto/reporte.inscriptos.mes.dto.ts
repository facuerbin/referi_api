import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class ReporteInscriptosMesDto {
  @ApiProperty()
  @IsUUID()
  idOrganizacion: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  fromYear: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  fromMonth: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  toYear: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  toMonth: number;
}
