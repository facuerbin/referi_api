import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class HorarioActividadDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dia: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  horaInicio: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(59)
  minutosInicio: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duracion: number;

  @ApiProperty()
  @IsUUID()
  idEspacio: string;
}
