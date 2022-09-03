import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoActividadDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  imgUrl: string;
}
