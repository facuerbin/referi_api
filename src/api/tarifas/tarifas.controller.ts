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
      .then((result) => res.status(200).send({ data: result }))
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

  @Get()
  findAll() {
    return this.tarifasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tarifasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTarifaDto: UpdateTarifaDto) {
    return this.tarifasService.update(+id, updateTarifaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tarifasService.remove(+id);
  }
}
