import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateSocioDto {
  @ApiProperty()
  @IsUUID()
  idUsuario: string;

  @ApiProperty()
  @IsUUID()
  idTurnoActividad: string;
}
