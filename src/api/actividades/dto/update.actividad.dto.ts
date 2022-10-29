import { ApiProperty } from '@nestjs/swagger';

export class UpdateActividadDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  cupo: number;

  @ApiProperty()
  imgUrl: string;

  @ApiProperty()
  idTipoActividad: string;
}
