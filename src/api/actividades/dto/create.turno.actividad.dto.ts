import { ApiProperty } from '@nestjs/swagger';
import { Horario } from '../entities/horario.entity';

export class CreateTurnoActividadDto {
  @ApiProperty()
  cupo: number;

  @ApiProperty()
  descripcion: string;

  @ApiProperty({ type: [Horario] })
  horarios: Horario[];

  @ApiProperty()
  idActividad: string;

  @ApiProperty()
  idEspacio: string;

  @ApiProperty()
  idEstadoActividad: string;
}
