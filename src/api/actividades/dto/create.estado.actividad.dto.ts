import { ApiProperty } from '@nestjs/swagger';

export class CreateEstadoActividadDto {
  @ApiProperty()
  estado: string;
}
