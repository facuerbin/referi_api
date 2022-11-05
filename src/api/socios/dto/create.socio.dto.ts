import { ApiProperty } from '@nestjs/swagger';

export class CreateSocioDto {
  @ApiProperty()
  idUsuario: string;

  @ApiProperty()
  idTurnoActividad: string;
}
