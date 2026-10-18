import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateActividadDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cupo: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imgUrl: string;

  @ApiProperty()
  @IsUUID()
  idOrganizacion: string;

  @ApiProperty()
  @IsUUID()
  idTipoActividad: string;
}
