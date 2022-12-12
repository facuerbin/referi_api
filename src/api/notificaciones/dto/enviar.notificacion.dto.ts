import { ApiProperty } from '@nestjs/swagger';

export class EnviarNotifiacionDto {
  @ApiProperty()
  idRemitente: string;

  @ApiProperty()
  tipoRemitente: string;

  @ApiProperty()
  idDestinatario?: string;

  @ApiProperty()
  tipoDestinatario: string;

  @ApiProperty()
  titulo: string;

  @ApiProperty()
  cuerpo: string;
}
