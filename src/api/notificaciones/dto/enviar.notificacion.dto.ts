import { ApiProperty } from '@nestjs/swagger';

export class EnviarNotifiacionDto {
  @ApiProperty()
  idRemitente: string;

  @ApiProperty()
  tipoDestinatario: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  cuerpo: string;

  @ApiProperty()
  fecha: Date;
}
