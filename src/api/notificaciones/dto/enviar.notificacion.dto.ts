import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import {
  TipoDestinatario,
  TipoRemitente,
} from '../entities/notificacion.entity';

export class EnviarNotificacionDto {
  @ApiProperty()
  @IsUUID()
  idRemitente: string;

  @ApiProperty({ enum: TipoRemitente })
  @IsEnum(TipoRemitente)
  tipoRemitente: string;

  // The panel sends '' for types that need no id, which @IsOptional() would reject.
  @ApiProperty({ required: false })
  @ValidateIf((dto) => !!dto.idDestinatario)
  @IsUUID()
  idDestinatario?: string;

  @ApiProperty({ enum: TipoDestinatario })
  @IsEnum(TipoDestinatario)
  tipoDestinatario: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cuerpo: string;
}
