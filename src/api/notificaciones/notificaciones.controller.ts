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
import { TipoDestinatario } from './entities/notificacion.entity';

@ApiTags('Notificaciones')
@Controller({ path: 'notificaciones', version: '1' })
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // @Post()
  // create(@Body() createNotificacioneDto: CreateNotificacioneDto) {
  //   return this.notificacionesService.create(createNotificacioneDto);
  // }

  @Post('socios')
  enviarNotificacionesSocios(@Body() dto: EnviarNotifiacionDto, @Res() res) {
    switch (dto.tipoDestinatario) {
      case TipoDestinatario.DEUDORES:
        return this.notificacionesService
          .enviarNotificacionDeudores(dto)
          .then((result) => res.status(200).send({ ...result }))
          .catch((error) => res.status(400).send({ error: error }));
      case TipoDestinatario.SOCIOS:
        return this.notificacionesService
          .enviarNotificacionSocios(dto)
          .then((result) => res.status(200).send({ ...result }))
          .catch((error) => res.status(400).send({ error: error }));
      case TipoDestinatario.ACTIVIDAD:
        return this.notificacionesService
          .enviarNotificacionActividad(dto)
          .then((result) => res.status(200).send({ ...result }))
          .catch((error) => res.status(400).send({ error: error }));
      case TipoDestinatario.TURNO_ACTIVIDAD:
        return this.notificacionesService
          .enviarNotificacionTurnoActividad(dto)
          .then((result) => res.status(200).send({ ...result }))
          .catch((error) => res.status(400).send({ error: error }));
      case TipoDestinatario.SOCIO:
        return this.notificacionesService
          .enviarNotificacionSocio(dto)
          .then((result) => res.status(200).send({ ...result }))
          .catch((error) => res.status(400).send({ error: error }));
      default:
        res
          .status(400)
          .send({ error: 'No se encontró el destinatario seleccionado.' });
    }
  }

  @Get('socios/:idUsuario')
  findAllByUser(@Param('idUsuario') idUser: string, @Res() res) {
    this.notificacionesService
      .findAllByUser(idUser)
      .then((result) => res.status(200).send({ ...result }))
      .catch((error) => res.status(400).send({ erro: error }));
  }

  // @Get()
  // findAll() {
  //   return this.notificacionesService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificacionesService.findOne(+id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificacionesService.remove(+id);
  // }
}
