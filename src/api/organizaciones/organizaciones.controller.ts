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
  CacheInterceptor,
} from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacionDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacionDto } from './dto/update.organizacion.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateEspacioDto } from './dto/create.espacio.dto';
import { CreatePersonalDto } from './dto/create.personal.dto';
import { JwtAuthGuard } from '../seguridad/jwt/jwt.auth.guard';

@ApiTags('Organizaciones')
@Controller({ path: 'organizaciones', version: '1' })
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Post()
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
  @UseInterceptors(CacheInterceptor)
  findAll(@Res() res) {
    return this.organizacionesService
      .findAll()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('tipos')
  @UseInterceptors(CacheInterceptor)
  listTipos(@Res() res) {
    return this.organizacionesService
      .listTipos()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('espacios')
  @UseInterceptors(CacheInterceptor)
  listEspacios(@Res() res) {
    return this.organizacionesService
      .listEspacios()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('espacios/:orgId')
  @UseInterceptors(CacheInterceptor)
  listEspaciosOrg(@Param('orgId') orgId: string, @Res() res) {
    return this.organizacionesService
      .listEspaciosOrg(orgId)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/roles')
  @UseInterceptors(CacheInterceptor)
  listRoles(@Res() res) {
    this.organizacionesService
      .listRoles()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  findOne(@Param('id') id: string) {
    return this.organizacionesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
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
  @UseInterceptors(CacheInterceptor)
  findEmployeeOrganization(@Param('id') id: string, @Res() res) {
    this.organizacionesService
      .listEmployeeOrganization(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/:idOrg/personal')
  @UseInterceptors(CacheInterceptor)
  listPersonalOrg(@Param('idOrg') idOrg: string, @Res() res) {
    this.organizacionesService
      .listPersonalOrganizacion(idOrg)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Patch('/personal/:idPersonal/:idRole')
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
  remove(@Param('id') id: string, @Res() res) {
    this.organizacionesService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
