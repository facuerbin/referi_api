import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTarifaDto } from './create-tarifa.dto';

export class UpdateTarifaDto {
  @ApiProperty({ required: false })
  nombre: string;

  @ApiProperty({ required: false })
  monto: number;

  @ApiProperty({ required: false })
  frecuencia: string;
}
