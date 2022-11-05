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
import { ApiTags } from '@nestjs/swagger';
import { ActividadesService } from './actividades.service';
import { BajaActividadDto } from './dto/baja.actividad.dto';
import { CreateActividadDto } from './dto/create.actividad.dto';
import { CreateEstadoActividadDto } from './dto/create.estado.actividad.dto';
import { CreateTipoActividadDto } from './dto/create.tipo.actividad.dto';
import { CreateTurnoActividadDto } from './dto/create.turno.actividad.dto';
import { UpdateActividadDto } from './dto/update.actividad.dto';

@ApiTags('Actividades')
@Controller({ path: 'actividades', version: '1' })
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  // Dar de baja de una actividad
  @Delete()
  solicitarBaja(@Body() bajaActividadDto: BajaActividadDto) {
    return 'Solicitar baja actividad';
  }

  @Post()
  create(@Body() createActividadeDto: CreateActividadDto, @Res() res) {
    this.actividadesService
      .createActividad(createActividadeDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error: error }));
  }

  @Post('tipo')
  createTipoActividad(
    @Body() createTipoActividadDto: CreateTipoActividadDto,
    @Res() res,
  ) {
    this.actividadesService
      .createTipoActividad(createTipoActividadDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('tipo/:idTipo')
  findActividadByTipo(@Param('idTipo') idTipo: string, @Res() res) {
    this.actividadesService
      .findActividadByTipo(idTipo)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('tipo')
  listTipoActividad(@Res() res) {
    this.actividadesService
      .listTipoActividad()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('estado')
  createEstadoActividad(
    @Body() createEstadoActividadDto: CreateEstadoActividadDto,
    @Res() res,
  ) {
    this.actividadesService
      .createEstadoActividad(createEstadoActividadDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('estado')
  listEstadoActividad(@Res() res) {
    this.actividadesService
      .listEstadoActividad()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('turno')
  createTurnoActividad(
    @Body() createTurnoActividadDto: CreateTurnoActividadDto,
    @Res() res,
  ) {
    this.actividadesService
      .createTurnoActividad(createTurnoActividadDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':idActividad')
  detailActividad(@Param('idActividad') idActividad: string, @Res() res) {
    this.actividadesService
      .detailActividad(idActividad)
      .then((result) => {
        res.status(200).send({ ...result });
      })
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('turno/:idTurno')
  detailTurno(@Param('idTurno') idTurno: string, @Res() res) {
    this.actividadesService
      .detailTurno(idTurno)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('organizacion/:idOrganizacion')
  findActividadByOrg(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    this.actividadesService
      .findActividadByOrg(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActividadeDto: UpdateActividadDto,
    @Res() res,
  ) {
    this.actividadesService
      .update(id, updateActividadeDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }
}
