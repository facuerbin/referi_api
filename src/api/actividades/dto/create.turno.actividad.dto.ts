import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { HorarioActividadDto } from './horario.actividad.dto';

export class CreateTurnoActividadDto {
  @ApiProperty()
  @IsUUID()
  idActividad: string;

  @ApiProperty({ type: [HorarioActividadDto] })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => HorarioActividadDto)
  horarios: HorarioActividadDto[];
}
