import { ApiProperty } from '@nestjs/swagger';

export class CreateActividadDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  cupo: number;

  @ApiProperty()
  imgUrl: string;

  @ApiProperty()
  idOrganizacion: string;

  @ApiProperty()
  idTipoActividad: string;
}
