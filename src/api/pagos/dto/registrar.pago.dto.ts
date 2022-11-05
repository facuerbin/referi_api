import { ApiProperty } from '@nestjs/swagger';

export class RegistrarPagoDto {
  @ApiProperty()
  medioDePago: MedioDePago;

  @ApiProperty({ required: false })
  numeroDeComprobante: string;

  @ApiProperty()
  idsCuota: string[];
}

export enum MedioDePago {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA BANCARIA',
  ELECTRONICO = 'MERCADOPAGO',
}
