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
} from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacionDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacione.dto';
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
        this.organizacionesService.createPersonal(result.id, {
          emailUsuario: result.email,
          rol: 'Owner',
        });
        this.organizacionesService.createEspacio(result.id, {
          nombre: 'SUM',
          capacidad: 100,
        });
        res.status(200).send({ ...result });
      })
      .catch((error) => res.status(400).send({ error }));
  }

  @Get()
  findAll(@Res() res) {
    return this.organizacionesService
      .findAll()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('tipos')
  listTipos(@Res() res) {
    return this.organizacionesService
      .listTipos()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('espacios')
  listEspacios(@Res() res) {
    return this.organizacionesService
      .listEspacios()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('espacios/:orgId')
  listEspaciosOrg(@Param('orgId') orgId: string, @Res() res) {
    return this.organizacionesService
      .listEspaciosOrg(orgId)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
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

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res) {
    this.organizacionesService
      .remove(id)
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
      .then((result) => res.status(200).send({ data: result }))
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
  findEmployeeOrganization(@Param('id') id: string, @Res() res) {
    this.organizacionesService
      .listEmployeeOrganization(id)
      .then((result) =>
        res.status(200).send({ data: result.map((org) => org.organizacion) }),
      )
      .catch((error) => res.status(400).send({ error }));
  }
}
