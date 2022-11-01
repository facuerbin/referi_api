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
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateFrecuenciaDto } from './dto/create.frecuencia.dto';

@ApiTags('Tarifas')
@Controller({ path: 'tarifas', version: '1' })
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Post()
  create(@Body() createTarifaDto: CreateTarifaDto, @Res() res) {
    this.tarifasService
      .create(createTarifaDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('frecuencia')
  createFrecuencia(
    @Body() createFrecuenciaDto: CreateFrecuenciaDto,
    @Res() res,
  ) {
    this.tarifasService
      .createFrecuencia(createFrecuenciaDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('frecuencia')
  findAllFrecuencias(@Res() res) {
    this.tarifasService
      .findAllFrecuencias()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get()
  findAll(@Res() res) {
    this.tarifasService
      .findAll()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/organizacion/:idOrg')
  findAllByOrg(@Param('idOrg') idOrg: string, @Res() res) {
    this.tarifasService
      .findByOrg(idOrg)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/actividad/:idActividad')
  findAllByActividad(@Param('idActividad') idActividad: string, @Res() res) {
    this.tarifasService
      .findByActividad(idActividad)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Res() res) {
    this.tarifasService
      .findOne(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTarifaDto: UpdateTarifaDto,
    @Res() res,
  ) {
    return this.tarifasService
      .update(id, updateTarifaDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res) {
    return this.tarifasService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
