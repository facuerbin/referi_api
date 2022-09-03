import { ApiProperty } from '@nestjs/swagger';

export class CreateSocioDto {
  @ApiProperty({ required: false })
  legajo: number;

  @ApiProperty()
  idUsuario: string;

  @ApiProperty()
  idActividadOrg: string;
}
