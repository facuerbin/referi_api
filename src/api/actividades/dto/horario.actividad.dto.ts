import { ApiProperty } from '@nestjs/swagger';

export class HorarioActividadDto {
  @ApiProperty()
  dia: string;

  @ApiProperty()
  horaInicio: number;

  @ApiProperty()
  minutosInicio: number;

  @ApiProperty()
  duracion: number;

  @ApiProperty()
  idEspacio: string;
}
