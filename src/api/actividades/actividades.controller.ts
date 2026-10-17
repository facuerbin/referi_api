import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActividadesService } from './actividades.service';
import { Actividad } from './entities/actividad.entity';
import { TipoActividad } from './entities/tipo.actividad.entity';
import { EstadoActividad } from './entities/estado.actividad.entity';
import { TurnoActividad } from './entities/turno.actividad.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';
import { SociosService } from '../socios/socios.service';
import { BajaActividadDto } from './dto/baja.actividad.dto';
import { CreateActividadDto } from './dto/create.actividad.dto';
import { CreateEstadoActividadDto } from './dto/create.estado.actividad.dto';
import { CreateTipoActividadDto } from './dto/create.tipo.actividad.dto';
import { CreateTurnoActividadDto } from './dto/create.turno.actividad.dto';
import { UpdateActividadDto } from './dto/update.actividad.dto';

@ApiTags('Actividades')
@Controller({ path: 'actividades', version: '1' })
export class ActividadesController {
  constructor(
    private readonly actividadesService: ActividadesService,
    private readonly sociosService: SociosService,
  ) {}

  // Dar de baja de una actividad
  @Delete()
  @ApiResponse({
    status: 200,
    description:
      'Da de baja la inscripción del socio en la actividad. Responde el resultado sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Inscripción inexistente o datos inválidos.')
  async solicitarBaja(@Body() bajaActividadDto: BajaActividadDto, @Res() res) {
    try {
      const result = await this.sociosService.removeByActividadSocio(
        bajaActividadDto.idSocio,
        bajaActividadDto.idActividad,
        bajaActividadDto.idOrganizacion,
      );
      if (result instanceof Error) {
        res.status(400).send({ error: result.message });
      } else {
        res.status(200).send(result);
      }
    } catch (error) {
      res.status(400).send({ error: error.message || error });
    }
  }

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Actividad creada. Responde sin envoltorio `data`.',
    type: Actividad,
  })
  @ApiErrorResponse(400, 'Datos de actividad inválidos.')
  create(@Body() createActividadeDto: CreateActividadDto, @Res() res) {
    this.actividadesService
      .createActividad(createActividadeDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error: error }));
  }

  @Post('tipo')
  @ApiDataResponse(TipoActividad, { description: 'Tipo de actividad creado.' })
  @ApiErrorResponse(400, 'Datos inválidos.')
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
  @ApiDataResponse(Actividad, {
    isArray: true,
    description: 'Actividades de un tipo determinado.',
  })
  findActividadByTipo(@Param('idTipo') idTipo: string, @Res() res) {
    this.actividadesService
      .findActividadByTipo(idTipo)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('tipo')
  @ApiDataResponse(TipoActividad, {
    isArray: true,
    description: 'Tipos de actividad disponibles.',
  })
  listTipoActividad(@Res() res) {
    this.actividadesService
      .listTipoActividad()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('estado')
  @ApiDataResponse(EstadoActividad, { description: 'Estado creado.' })
  @ApiErrorResponse(400, 'Datos inválidos.')
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
  @ApiDataResponse(EstadoActividad, {
    isArray: true,
    description: 'Estados de actividad disponibles.',
  })
  listEstadoActividad(@Res() res) {
    this.actividadesService
      .listEstadoActividad()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('turno')
  @ApiDataResponse(TurnoActividad, {
    description: 'Turno de actividad creado, con sus horarios.',
  })
  @ApiErrorResponse(400, 'Horario o espacio inválido.')
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
  @ApiResponse({
    status: 200,
    description:
      'Detalle de una actividad con su organización, tipo, turnos y tarifas. Responde sin envoltorio `data`. Nota: `tarifas` es una relación lazy de TypeORM y se serializa bajo la clave `__tarifas__`.',
    type: Actividad,
  })
  @ApiErrorResponse(400, 'Actividad inexistente.')
  detailActividad(@Param('idActividad') idActividad: string, @Res() res) {
    this.actividadesService
      .detailActividad(idActividad)
      .then((result) => {
        res.status(200).send({ ...result });
      })
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('turno/:idTurno')
  @ApiDataResponse(TurnoActividad, {
    description:
      'Detalle de un turno con su actividad, estado y horarios (espacio y horario incluidos).',
  })
  @ApiErrorResponse(400, 'Turno inexistente.')
  detailTurno(@Param('idTurno') idTurno: string, @Res() res) {
    this.actividadesService
      .detailTurno(idTurno)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('organizacion/:idOrganizacion')
  @ApiDataResponse(Actividad, {
    isArray: true,
    description: 'Actividades de una organización.',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Actividad actualizada. Responde sin envoltorio `data`.',
    type: Actividad,
  })
  @ApiErrorResponse(400, 'Datos inválidos o actividad inexistente.')
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
  @ApiResponse({
    status: 200,
    description: 'Da de baja la actividad (borrado lógico).',
  })
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }

  @Get('reporte/ingresos-por-actividad/:idOrganizacion')
  @ApiResponse({
    status: 200,
    description:
      'Reporte de ingresos agrupados por actividad para una organización. Responde un array sin envoltorio `data`.',
  })
  async reporteIngresosActividad(
    @Param('idOrganizacion') idOrganizacion: string,
  ) {
    const results =
      await this.actividadesService.ingresosPorActividadPorOrganizacion(
        idOrganizacion,
      );
    return results;
  }

  @Get('reporte/deuda-por-actividad/:idOrganizacion')
  @ApiResponse({
    status: 200,
    description:
      'Reporte de deuda agrupada por actividad para una organización. Responde un array sin envoltorio `data`.',
  })
  async reporteDeudaActividad(@Param('idOrganizacion') idOrganizacion: string) {
    const results =
      await this.actividadesService.deudaPorActividadPorOrganizacion(
        idOrganizacion,
      );
    return results;
  }
}
