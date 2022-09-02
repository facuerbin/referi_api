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
import { OrganizacionesService } from './organizaciones.service';
import { CreateOrganizacionDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacione.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateEspacioDto } from './dto/create.espacio.dto';
import { CreatePersonalDto } from './dto/create.personal.dto';

@ApiTags('Organizaciones')
@Controller({ path: 'organizaciones', version: '1' })
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Post()
  create(@Body() createOrganizacioneDto: CreateOrganizacionDto, @Res() res) {
    return this.organizacionesService
      .create(createOrganizacioneDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get()
  findAll(@Res() res) {
    return this.organizacionesService
      .findAll()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizacionesService.findOne(id);
  }

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
}
