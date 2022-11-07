import { ApiProperty } from '@nestjs/swagger';

export class UpdateTarifaDto {
  @ApiProperty({ required: false })
  nombre: string;

  @ApiProperty({ required: false })
  monto: number;

  @ApiProperty({ required: false })
  nombreFrecuencia: string;

  @ApiProperty({ required: false })
  esOpcional: boolean;
}
