import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MedioDePago } from '../entities/pago.entity';

export class RegistrarPagoDto {
  @ApiProperty({ enum: MedioDePago })
  @IsEnum(MedioDePago)
  medioDePago: MedioDePago;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numeroDeComprobante: string;

  @ApiProperty({ type: [String] })
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  idsCuota: string[];
}
