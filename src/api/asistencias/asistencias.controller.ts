import { Controller, Get, Post, Body, Param, Res, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AsistenciasService } from './asistencias.service';
import { Asistente } from './entities/asistente.entity';
import { PlanillaAsistencia } from './entities/planilla.asistencia.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';
import { AppAsistenciaDto } from './dto/app.asistencia.dto';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ListPlanillaDto } from './dto/list.planilla.dto';

@ApiTags('Asistencias')
@Controller({ path: 'asistencias', version: '1' })
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post('crear')
  @ApiDataResponse(Asistente, {
    description:
      'Registra la asistencia de un socio. Si el cuerpo incluye `emailUsuario` se resuelve el socio por email; si no, por id.',
  })
  @ApiErrorResponse(400, 'Socio inexistente o datos inválidos.')
  create(@Body() createAsistenciaDto: CreateAsistenciaDto, @Res() res) {
    (createAsistenciaDto.emailUsuario
      ? this.asistenciasService.registerAttendanceWithEmail(createAsistenciaDto)
      : this.asistenciasService.registerAttendance(createAsistenciaDto)
    )
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post(':idOrg')
  @ApiDataResponse(Asistente, {
    description: 'Registra la asistencia del usuario escaneado desde la app.',
  })
  @ApiErrorResponse(400, 'Usuario u organización inexistentes.')
  registerUserAttendance(
    @Param('idOrg') idOrg: string,
    @Body() asistenciaDto: AppAsistenciaDto,
    @Res() res,
  ) {
    this.asistenciasService
      .registerAppAttendance(idOrg, asistenciaDto.id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post()
  @ApiDataResponse(PlanillaAsistencia, {
    isArray: true,
    description:
      'Lista planillas de asistencia según los filtros enviados en el cuerpo.',
  })
  findAll(@Body() listPlanillaDto: ListPlanillaDto, @Res() res) {
    this.asistenciasService
      .findAll(listPlanillaDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description:
      'Planilla de asistencia de una organización para la fecha indicada en `?fecha=`. Responde sin envoltorio `data`.',
    type: PlanillaAsistencia,
  })
  @ApiErrorResponse(400, 'Organización inexistente o fecha inválida.')
  findOne(@Param('id') idOrg: string, @Query('fecha') fecha: Date, @Res() res) {
    this.asistenciasService
      .findOne(fecha, idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
