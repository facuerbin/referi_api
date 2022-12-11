import { Controller, Get, Post, Body, Param, Res, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ListPlanillaDto } from './dto/list.planilla.dto';

@ApiTags('Asistencias')
@Controller({ path: 'asistencias', version: '1' })
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Post('crear')
  create(@Body() createAsistenciaDto: CreateAsistenciaDto, @Res() res) {
    this.asistenciasService
      .create(createAsistenciaDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post()
  findAll(@Body() listPlanillaDto: ListPlanillaDto, @Res() res) {
    this.asistenciasService
      .findAll(listPlanillaDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  findOne(@Param('id') idOrg: string, @Query('fecha') fecha: Date, @Res() res) {
    this.asistenciasService
      .findOne(fecha, idOrg)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
