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
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
import { ApiTags } from '@nestjs/swagger';
import { EnviarNotifiacionDto } from './dto/enviar.notificacion.dto';

@ApiTags('Notificaciones')
@Controller({ path: 'notificaciones', version: '1' })
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  create(@Body() createNotificacioneDto: CreateNotificacioneDto) {
    return this.notificacionesService.create(createNotificacioneDto);
  }

  @Post('socios')
  enviarNotificacionesSocios(@Body() dto: EnviarNotifiacionDto, @Res() res) {
    return this.notificacionesService
      .enviarNotificacionSocios(dto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error: error }));
  }

  @Get()
  findAll() {
    return this.notificacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificacionesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificacioneDto: UpdateNotificacioneDto,
  ) {
    return this.notificacionesService.update(+id, updateNotificacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(+id);
  }
}
