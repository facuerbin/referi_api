import { ApiProperty } from '@nestjs/swagger';
import { Horario } from '../entities/horario.entity';

export class CreateTurnoActividadDto {
  @ApiProperty()
  idActividad: string;

  @ApiProperty()
  idEspacio: string;

  @ApiProperty({ type: [Horario] })
  horarios: Horario[];

  @ApiProperty()
  idsTarifa: string[];
}
