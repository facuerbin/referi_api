import { ApiProperty } from '@nestjs/swagger';

export class CreateEspacioDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  capacidad: number;
}
