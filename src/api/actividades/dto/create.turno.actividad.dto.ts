import { ApiProperty } from '@nestjs/swagger';
import { HorarioActividadDto } from './horario.actividad.dto';

export class CreateTurnoActividadDto {
  @ApiProperty()
  idActividad: string;

  @ApiProperty()
  horarios: HorarioActividadDto[];
}
