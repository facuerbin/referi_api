import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { SociosService } from './socios.service';
import { CreateSocioDto } from './dto/create.socio.dto';
import {
  ApiBearerAuth,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Inscripcion } from './entities/inscripcion.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';
import { ReporteInscriptosMesDto } from './dto/reporte.inscriptos.mes.dto';
import { ReporteInscriptosActividadMesDto } from './dto/reporte.inscriptos.actividad.mes.dto';

@ApiBearerAuth()
@ApiTags('Socios')
@Controller({ path: 'socios', version: '1' })
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Post()
  @ApiDataResponse(Inscripcion, {
    description:
      'Inscribe a un usuario en un turno de actividad y genera sus cuotas.',
  })
  @ApiErrorResponse(400, 'Turno inexistente, sin cupo, o usuario ya inscripto.')
  create(@Body() createSocioDto: CreateSocioDto, @Res() res) {
    this.sociosService
      .create(createSocioDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => {
        res.status(400).send({ error: error.message ? error.message : error });
      });
  }

  @Get('organizacion/:idOrganizacion')
  @ApiDataResponse(Inscripcion, {
    isArray: true,
    description: 'Inscripciones de una organización, con usuario y actividad.',
  })
  findByOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    this.sociosService
      .findByOrg(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('organizacion/:idOrganizacion/backup')
  @ApiProduces('text/csv')
  @ApiResponse({
    status: 200,
    description:
      'Descarga las inscripciones de la organización como CSV (`attachment; filename="backup.csv"`).',
  })
  @ApiErrorResponse(400, 'Organización inexistente.')
  async backupSocios(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res({ passthrough: true }) res,
  ): Promise<StreamableFile> {
    try {
      const csv = await this.sociosService.backupSociosByOrg(idOrganizacion);
      const buffer = Buffer.from('' + csv, 'utf-8');
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="backup.csv"',
      });
      return new StreamableFile(new Uint8Array(buffer));
    } catch (e) {
      return res.status(400).send({ error: e });
    }
  }

  @Post('organizacion/:idOrganizacion/backup')
  @ApiDataResponse(Inscripcion, {
    isArray: true,
    description:
      'Restaura inscripciones desde un backup CSV previamente generado.',
  })
  @ApiErrorResponse(400, 'CSV inválido u organización inexistente.')
  async restoreSocios(
    @Param('idOrganizacion') idOrganizacion: string,
    @Body() csvArray: string[][],
    @Res({ passthrough: true }) res,
  ) {
    this.sociosService
      .restoreSociosOrg(csvArray)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => {
        res.status(400).send({ error: error.message ? error.message : error });
      });
  }

  @Get('organizacion/:idOrganizacion/deudores')
  @ApiDataResponse(Inscripcion, {
    isArray: true,
    description:
      'Inscripciones con cuotas impagas vencidas. Es la fuente de destinatarios de las notificaciones a deudores.',
  })
  findDeudoresByOrganizacion(
    @Param('idOrganizacion') idOrganizacion: string,
    @Res() res,
  ) {
    this.sociosService
      .findDeudoresByOrg(idOrganizacion)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('actividad/turno/:idTurnoActividad')
  @ApiDataResponse(Inscripcion, {
    isArray: true,
    description: 'Inscriptos a un turno de actividad.',
  })
  findByTurnoActividad(
    @Param('idTurnoActividad') idTurnoActividad: string,
    @Res() res,
  ) {
    this.sociosService
      .findByTurnoActividad(idTurnoActividad)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('actividad/:idActividad')
  @ApiDataResponse(Inscripcion, {
    isArray: true,
    description: 'Inscriptos a una actividad (todos sus turnos).',
  })
  findByActividad(@Param('idActividad') idActividad: string, @Res() res) {
    this.sociosService
      .findByActividad(idActividad)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('usuario/:idUsuario')
  @ApiDataResponse(Inscripcion, {
    isArray: true,
    description:
      'Inscripciones de un usuario, con el turno, la actividad, los horarios y la organización.',
  })
  findBySocio(@Param('idUsuario') idUsuario: string, @Res() res) {
    this.sociosService
      .findByUser(idUsuario)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  @ApiDataResponse(Inscripcion, { description: 'Detalle de una inscripción.' })
  @ApiErrorResponse(400, 'Inscripción inexistente.')
  findOne(@Param('id') id: string, @Res() res) {
    this.sociosService
      .findOne(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description:
      'Da de baja la inscripción (borrado lógico). Responde sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Inscripción inexistente.')
  remove(@Param('id') id: string, @Res() res) {
    return this.sociosService
      .remove(id)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error: error.message }));
  }

  @Post('reporte/inscriptos-mes')
  @ApiResponse({
    status: 200,
    description:
      'Inscriptos por mes en un rango de fechas. Responde el objeto del reporte sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Organización o actividad inexistente.')
  reporteSociosPorMes(@Body() dto: ReporteInscriptosMesDto, @Res() res) {
    this.sociosService
      .inscriptosPorMes(dto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('reporte/actividad-inscriptos-mes')
  @ApiResponse({
    status: 200,
    description:
      'Inscriptos por mes para una actividad. Responde el objeto del reporte sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Organización o actividad inexistente.')
  reporteSociosPorActividadMes(
    @Body() dto: ReporteInscriptosActividadMesDto,
    @Res() res,
  ) {
    this.sociosService
      .inscriptosPorActividadPorMes(dto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('reporte/rango-etario/:idOrg')
  @ApiResponse({
    status: 200,
    description:
      'Distribución de socios por rango etario. Responde el objeto del reporte sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Organización o actividad inexistente.')
  reporteRangoEtarioSocios(@Param('idOrg') idOrg: string, @Res() res) {
    this.sociosService
      .rangoEtarioSociosOrganizacion(idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('reporte/rango-etario-actividad/:idActividad')
  @ApiResponse({
    status: 200,
    description:
      'Distribución por rango etario para una actividad. Responde el objeto del reporte sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Organización o actividad inexistente.')
  reporteRangoEtarioSociosActividad(
    @Param('idActividad') idActividad: string,
    @Res() res,
  ) {
    this.sociosService
      .rangoEtarioSociosActividad(idActividad)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('reporte/distribucion-estados/:idOrg')
  @ApiResponse({
    status: 200,
    description:
      'Distribución de socios por estado de inscripción. Responde el objeto del reporte sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Organización o actividad inexistente.')
  reporteEstadoSocios(@Param('idOrg') idOrg: string, @Res() res) {
    this.sociosService
      .sociosPorEstadoOrganizacion(idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('reporte/deudores-por-actividad/:idOrg')
  @ApiResponse({
    status: 200,
    description:
      'Cantidad de deudores agrupada por actividad. Responde el objeto del reporte sin envoltorio `data`.',
  })
  @ApiErrorResponse(400, 'Organización o actividad inexistente.')
  reporteDeudoresPorActividad(@Param('idOrg') idOrg: string, @Res() res) {
    this.sociosService
      .sociosDeudoresPorActividad(idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
