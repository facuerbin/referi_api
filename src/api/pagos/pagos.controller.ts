import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegistrarPagoDto } from './dto/registrar.pago.dto';
import { Pago } from './entities/pago.entity';
import { Cuota } from './entities/cuota.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';

@ApiBearerAuth()
@ApiTags('Pagos')
@Controller({ path: 'pagos', version: '1' })
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description:
      'Registra el pago de una o varias cuotas. Responde el pago creado sin envoltorio `data`.',
    type: Pago,
  })
  @ApiErrorResponse(400, 'Cuotas inexistentes o medioDePago inválido.')
  registrarPago(@Body() createPagoDto: RegistrarPagoDto, @Res() res) {
    return this.pagosService
      .registrarPago(createPagoDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('inscripto/:idInscripto')
  @ApiDataResponse(Pago, {
    isArray: true,
    description: 'Pagos registrados para una inscripción.',
  })
  @ApiErrorResponse(400, 'Error al consultar los pagos.')
  listPagosInscripto(@Param('idInscripto') idInscripto: string, @Res() res) {
    return this.pagosService
      .consultarPagosInscripto(idInscripto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('organizacion/:idOrganizacion')
  @ApiDataResponse(Pago, {
    isArray: true,
    description: 'Pagos registrados en una organización.',
  })
  @ApiErrorResponse(400, 'Error al consultar los pagos.')
  listPagosOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    return this.pagosService
      .consultarPagosOrganizacion(idOrganizacion)
      .then((result) => {
        res.status(200).send({ data: result });
      })
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('usuario/:idUsuario')
  @ApiDataResponse(Pago, {
    isArray: true,
    description: 'Pagos realizados por un usuario.',
  })
  @ApiErrorResponse(400, 'Error al consultar los pagos.')
  listPagosUsuario(@Param('idUsuario') idUsuario: string, @Res() res) {
    return this.pagosService
      .consultarPagosUsuario(idUsuario)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('cuotas/inscripto/:idInscripto')
  @ApiDataResponse(Cuota, {
    isArray: true,
    description: 'Cuotas de una inscripción.',
  })
  @ApiErrorResponse(400, 'Error al consultar las cuotas.')
  listCuotasInscripto(@Param('idInscripto') idInscripto: string, @Res() res) {
    return this.pagosService
      .consultarCuotasInscripto(idInscripto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('cuotas/organizacion/:idOrganizacion')
  @ApiDataResponse(Cuota, {
    isArray: true,
    description: 'Cuotas emitidas en una organización.',
  })
  @ApiErrorResponse(400, 'Error al consultar las cuotas.')
  listCuotasOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    return this.pagosService
      .consultarCuotasOrganizacion(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('cuotas/usuario/:idUsuario')
  @ApiDataResponse(Cuota, {
    isArray: true,
    description:
      'Cuotas de un usuario, con su tarifa, actividad y pago asociado cuando existe.',
  })
  @ApiErrorResponse(400, 'Error al consultar las cuotas.')
  listCuotasUsuario(@Param('idUsuario') idUsuario: string, @Res() res) {
    return this.pagosService
      .consultarCuotasUsuario(idUsuario)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description:
      'Detalle de un pago, incluyendo sus cuotas, la inscripción y la organización. Responde sin envoltorio `data`.',
    type: Pago,
  })
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }
}
