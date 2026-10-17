import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MedioDePago } from '../entities/pago.entity';

export class RegistrarPagoDto {
  @ApiProperty({ enum: MedioDePago })
  @IsEnum(MedioDePago)
  medioDePago: MedioDePago;

  @ApiProperty({ required: false })
  numeroDeComprobante: string;

  @ApiProperty()
  idsCuota: string[];
}
