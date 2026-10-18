import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateTarifaDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombreFrecuencia: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  esOpcional: boolean;
}
