import { ApiProperty } from '@nestjs/swagger';

export class CreateAsistenciaDto {
  @ApiProperty()
  idOrg: string;

  @ApiProperty()
  hora: Date;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  dni: number;
}
