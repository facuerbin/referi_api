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
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pagos')
@Controller({ path: 'pagos', version: '1' })
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  create(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
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
    return this.pagosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoDto: UpdatePagoDto) {
    return this.pagosService.update(+id, updatePagoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}
