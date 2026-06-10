import { ApiProperty } from '@nestjs/swagger';
import { MedioDePago } from '../entities/pago.entity';

export class RegistrarPagoDto {
  @ApiProperty()
  medioDePago: MedioDePago;

  @ApiProperty({ required: false })
  numeroDeComprobante: string;

  @ApiProperty()
  idsCuota: string[];
}
