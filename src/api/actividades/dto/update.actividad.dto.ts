import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateActividadDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nombre: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cupo: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imgUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  idTipoActividad: string;
}
