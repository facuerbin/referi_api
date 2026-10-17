import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update.organizacion.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Organizacion } from './entities/organizacion.entity';
import { TipoOrganizacion } from './entities/tipo.organizacion.entity';
import { Espacio } from './entities/espacio.entity';
import { Rol } from './entities/rol.entity';
import { PersonalOrganizacion } from './entities/personal.organizacion.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';
import { CreateEspacioDto } from './dto/create.espacio.dto';
import { CreatePersonalDto } from './dto/create.personal.dto';
import { JwtAuthGuard } from '../seguridad/jwt/jwt.auth.guard';

@ApiTags('Organizaciones')
@Controller({ path: 'organizaciones', version: '1' })
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description:
      'Crea la organización junto a su dirección e información de pago. Responde sin envoltorio `data`.',
    type: Organizacion,
  })
  @ApiErrorResponse(400, 'Datos de organización inválidos.')
  create(@Body() createOrganizacioneDto: CreateOrganizacionDto, @Res() res) {
    return this.organizacionesService
      .create(createOrganizacioneDto)
      .then((result) => {
        this.organizacionesService.createEspacio(result.id, {
          nombre: 'SUM',
          capacidad: 100,
        });
        res.status(200).send({ ...result });
      })
      .catch((error) => res.status(400).send({ error }));
  }

  @Get()
  @ApiDataResponse(Organizacion, {
    isArray: true,
    description: 'Organizaciones activas.',
  })
  findAll(@Res() res) {
    return this.organizacionesService
      .findAll()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('tipos')
  @ApiDataResponse(TipoOrganizacion, {
    isArray: true,
    description: 'Tipos de organización disponibles.',
  })
   
  listTipos(@Res() res) {
    return this.organizacionesService
      .listTipos()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('espacios')
  @ApiDataResponse(Espacio, {
    isArray: true,
    description: 'Todos los espacios físicos.',
  })
  listEspacios(@Res() res) {
    return this.organizacionesService
      .listEspacios()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('espacios/:orgId')
  @ApiDataResponse(Espacio, {
    isArray: true,
    description: 'Espacios físicos de una organización.',
  })
   
  listEspaciosOrg(@Param('orgId') orgId: string, @Res() res) {
    return this.organizacionesService
      .listEspaciosOrg(orgId)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/roles')
  @ApiDataResponse(Rol, {
    isArray: true,
    description: 'Roles asignables al personal, con sus permisos.',
  })
   
  listRoles(@Res() res) {
    this.organizacionesService
      .listRoles()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description:
      'Detalle de una organización con su tipo, dirección e información de pago. Responde sin envoltorio `data`.',
    type: Organizacion,
  })
  findOne(@Param('id') id: string) {
    return this.organizacionesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiDataResponse(Organizacion, { description: 'Organización actualizada.' })
  @ApiErrorResponse(400, 'Datos inválidos u organización inexistente.')
  update(
    @Param('id') id: string,
    @Body() updateOrganizacioneDto: UpdateOrganizacionDto,
    @Res() res,
  ) {
    this.organizacionesService
      .update(id, updateOrganizacioneDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post(':id/espacio')
  @ApiResponse({
    status: 200,
    description:
      'Crea un espacio físico en la organización. Responde sin envoltorio `data`.',
    type: Espacio,
  })
  @ApiErrorResponse(400, 'Datos inválidos u organización inexistente.')
  createEspacio(
    @Param('id') id: string,
    @Res() res,
    @Body() createEspacioDto: CreateEspacioDto,
  ) {
    this.organizacionesService
      .createEspacio(id, createEspacioDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post(':id/personal')
  @ApiDataResponse(PersonalOrganizacion, {
    description:
      'Agrega un usuario al personal de la organización con el rol indicado.',
  })
  @ApiErrorResponse(400, 'Usuario, rol u organización inexistentes.')
  createPersonal(
    @Param('id') id: string,
    @Res() res,
    @Body() createPersonalDto: CreatePersonalDto,
  ) {
    this.organizacionesService
      .createPersonal(id, createPersonalDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/personal/:id')
  @ApiDataResponse(PersonalOrganizacion, {
    isArray: true,
    description:
      'Organizaciones en las que un usuario es personal, con su rol. Lo usa el panel web para resolver la organización activa.',
  })
   
  findEmployeeOrganization(@Param('id') id: string, @Res() res) {
    this.organizacionesService
      .listEmployeeOrganization(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/:idOrg/personal')
  @ApiDataResponse(PersonalOrganizacion, {
    isArray: true,
    description: 'Personal de una organización, con usuario y rol.',
  })
   
  listPersonalOrg(@Param('idOrg') idOrg: string, @Res() res) {
    this.organizacionesService
      .listPersonalOrganizacion(idOrg)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Patch('/personal/:idPersonal/:idRole')
  @ApiDataResponse(PersonalOrganizacion, {
    description: 'Cambia el rol de un integrante del personal.',
  })
  @ApiErrorResponse(400, 'Personal o rol inexistentes.')
  changePersonalOrgRole(
    @Param('idPersonal') idPersonal: string,
    @Param('idRole') idRole: string,
    @Res() res,
  ) {
    this.organizacionesService
      .changeRole(idPersonal, idRole)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Delete('/:idOrg/personal/:idPersonal')
  @ApiResponse({
    status: 200,
    description: 'Quita a un integrante del personal de la organización.',
    schema: { properties: { data: { type: 'object' } } },
  })
  @ApiErrorResponse(400, 'Personal inexistente.')
  deletePersonalOrg(
    @Param('idOrg') idOrg: string,
    @Param('idPersonal') idPersonal: string,
    @Res() res,
  ) {
    this.organizacionesService
      .deletePersonal(idOrg, idPersonal)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Da de baja la organización (borrado lógico).',
    schema: { properties: { data: { type: 'object' } } },
  })
  remove(@Param('id') id: string, @Res() res) {
    this.organizacionesService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
