import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { ApiTags } from '@nestjs/swagger';
import { RegistrarPagoDto } from './dto/registrar.pago.dto';

@ApiTags('Pagos')
@Controller({ path: 'pagos', version: '1' })
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  registrarPago(@Body() createPagoDto: RegistrarPagoDto, @Res() res) {
    return this.pagosService
      .registrarPago(createPagoDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('inscripto/:idInscripto')
  listPagosInscripto(@Param('idInscripto') idInscripto: string, @Res() res) {
    return this.pagosService
      .consultarPagosInscripto(idInscripto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('organizacion/:idOrganizacion')
  listPagosOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    return this.pagosService
      .consultarPagosOrganizacion(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('usuario/:idUsuario')
  listPagosUsuario(@Param('idUsuario') idUsuario: string, @Res() res) {
    return this.pagosService
      .consultarPagosUsuario(idUsuario)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('cuotas/:idInscripto')
  listCuotasInscripto(@Param('idInscripto') idInscripto: string, @Res() res) {
    return this.pagosService
      .consultarCuotasInscripto(idInscripto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('cuotas/organizacion/:idOrganizacion')
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
  listCuotasUsuario(@Param('idUsuario') idUsuario: string, @Res() res) {
    return this.pagosService
      .consultarCuotasUsuario(idUsuario)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }
}
