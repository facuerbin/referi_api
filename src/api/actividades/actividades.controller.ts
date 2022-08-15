import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActividadesService } from './actividades.service';
import { BajaActividadDto } from './dto/baja.actividad.dto';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { InscribirActividadDto } from './dto/inscribir.actividad.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';

@ApiTags('Actividades')
@Controller({ path: 'actividades', version: '1' })
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  // Inscribir a una actividad
  @Post()
  inscribir(@Body() inscribirActividadDto: InscribirActividadDto) {
    return 'Inscribir a actividad';
  }

  // Dar de baja de una actividad
  @Delete()
  solicitarBaja(@Body() bajaActividadDto: BajaActividadDto) {
    return 'Solicitar baja actividad';
  }

  // Consultar actividades por organización
  // Consultar activdades por tipo

  @Post()
  create(@Body() createActividadeDto: CreateActividadeDto) {
    return this.actividadesService.create(createActividadeDto);
  }

  @Get()
  findAll() {
    return this.actividadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActividadeDto: UpdateActividadeDto,
  ) {
    return this.actividadesService.update(+id, updateActividadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(+id);
  }
}
