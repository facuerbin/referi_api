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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateFrecuenciaDto } from './dto/create.frecuencia.dto';
import { Tarifa } from './entities/tarifa.entity';
import { Frecuencia } from './entities/frecuencia.entity';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';

@ApiBearerAuth()
@ApiTags('Tarifas')
@Controller({ path: 'tarifas', version: '1' })
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Tarifa creada. Responde sin envoltorio `data`.',
    type: Tarifa,
  })
  @ApiErrorResponse(400, 'Datos de tarifa inválidos.')
  create(@Body() createTarifaDto: CreateTarifaDto, @Res() res) {
    this.tarifasService
      .create(createTarifaDto)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Post('frecuencia')
  @ApiDataResponse(Frecuencia, { description: 'Frecuencia de cobro creada.' })
  @ApiErrorResponse(400, 'Datos de frecuencia inválidos.')
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
  @ApiDataResponse(Frecuencia, {
    isArray: true,
    description: 'Frecuencias de cobro disponibles.',
  })
  findAllFrecuencias(@Res() res) {
    this.tarifasService
      .findAllFrecuencias()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get()
  @ApiDataResponse(Tarifa, { isArray: true, description: 'Todas las tarifas.' })
  findAll(@Res() res) {
    this.tarifasService
      .findAll()
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/organizacion/:idOrg')
  @ApiDataResponse(Tarifa, {
    isArray: true,
    description: 'Tarifas de las actividades de una organización.',
  })
  findAllByOrg(@Param('idOrg') idOrg: string, @Res() res) {
    this.tarifasService
      .findByOrg(idOrg)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get('/actividad/:idActividad')
  @ApiDataResponse(Tarifa, {
    isArray: true,
    description: 'Tarifas de una actividad.',
  })
  findAllByActividad(@Param('idActividad') idActividad: string, @Res() res) {
    this.tarifasService
      .findByActividad(idActividad)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Get(':id')
  @ApiDataResponse(Tarifa, { description: 'Detalle de una tarifa.' })
  findOne(@Param('id') id: string, @Res() res) {
    this.tarifasService
      .findOne(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }

  @Patch(':id')
  @ApiDataResponse(Tarifa, { description: 'Tarifa actualizada.' })
  @ApiErrorResponse(400, 'Datos inválidos o tarifa inexistente.')
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
  @ApiResponse({
    status: 200,
    description: 'Tarifa dada de baja (borrado lógico).',
    schema: { properties: { data: { type: 'object' } } },
  })
  @ApiErrorResponse(400, 'Tarifa inexistente.')
  remove(@Param('id') id: string, @Res() res) {
    return this.tarifasService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error }));
  }
}
