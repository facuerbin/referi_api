import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateTarifaDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monto: number;

  @ApiProperty()
  @IsBoolean()
  esOpcional: boolean;

  // Matched against Frecuencia.nombre by the service, not an id.
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombreFrecuencia: string;

  @ApiProperty()
  @IsUUID()
  idOrganizacion: string;

  @ApiProperty()
  @IsUUID()
  idActividad: string;
}
