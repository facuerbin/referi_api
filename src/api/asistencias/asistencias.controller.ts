import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AsistenciasService } from './asistencias.service';
import { Asistente } from './entities/asistente.entity';
import { PlanillaAsistencia } from './entities/planilla.asistencia.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ListPlanillaDto } from './dto/list.planilla.dto';
import {
  OrgStaffGuard,
  PermisoOrganizacion,
} from '../seguridad/jwt/org.staff.guard';

@ApiBearerAuth()
@ApiTags('Asistencias')
@Controller({ path: 'asistencias', version: '1' })
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @UseGuards(OrgStaffGuard)
  @PermisoOrganizacion('ASISTENCIA')
  @Post('crear')
  @ApiDataResponse(Asistente, {
    description:
      'Registra la asistencia de un socio en la planilla de `idOrg`. Si el cuerpo incluye `emailUsuario` se resuelve el socio por email; si no, se registra con los datos enviados. Requiere ser personal de esa organización con permiso ASISTENCIA.',
  })
  @ApiErrorResponse(403, 'No es personal de esa organización.')
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
    description:
      'Registra la asistencia del usuario autenticado, que es quien escanea el QR de la organización. El usuario se toma del token: cualquier `id` enviado en el cuerpo se ignora. Requiere una inscripción activa en esa organización.',
  })
  @ApiErrorResponse(403, 'El usuario no está inscripto en esa organización.')
  @ApiErrorResponse(400, 'Organización inexistente.')
  registerUserAttendance(
    @Param('idOrg') idOrg: string,
    @Req() request,
    @Res() res,
  ) {
    this.asistenciasService
      .registerAppAttendance(idOrg, request.user.userId)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @UseGuards(OrgStaffGuard)
  @PermisoOrganizacion('ASISTENCIA')
  @Post()
  @ApiDataResponse(PlanillaAsistencia, {
    isArray: true,
    description:
      'Lista planillas de asistencia de `idOrg` entre dos fechas. Requiere ser personal de esa organización con permiso ASISTENCIA.',
  })
  @ApiErrorResponse(403, 'No es personal de esa organización.')
  findAll(@Body() listPlanillaDto: ListPlanillaDto, @Res() res) {
    this.asistenciasService
      .findAll(listPlanillaDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @UseGuards(OrgStaffGuard)
  @PermisoOrganizacion('ASISTENCIA')
  @Get(':idOrg')
  @ApiResponse({
    status: 200,
    description:
      'Planilla de asistencia de una organización para la fecha indicada en `?fecha=`. Responde sin envoltorio `data`. Requiere ser personal de esa organización con permiso ASISTENCIA.',
    type: PlanillaAsistencia,
  })
  @ApiErrorResponse(403, 'No es personal de esa organización.')
  @ApiErrorResponse(400, 'Organización inexistente o fecha inválida.')
  findOne(
    @Param('idOrg') idOrg: string,
    @Query('fecha') fecha: Date,
    @Res() res,
  ) {
    this.asistenciasService
      .findOne(fecha, idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
