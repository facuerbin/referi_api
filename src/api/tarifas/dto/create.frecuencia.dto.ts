import { ApiProperty } from '@nestjs/swagger';

export class CreateFrecuenciaDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  cantDias: number;
}
