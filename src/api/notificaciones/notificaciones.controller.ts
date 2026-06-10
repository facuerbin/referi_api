import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnviarNotificacionDto } from './dto/enviar.notificacion.dto';
import { Notificacion, TipoDestinatario } from './entities/notificacion.entity';
import { NotificationResponseSchema } from './response/notification.response.dto';

@ApiTags('Notificaciones')
@Controller({ path: 'notificaciones', version: '1' })
export class NotificacionesController {
  private readonly logger = new Logger(NotificacionesController.name);

  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post('read/:id')
  readNotification(@Param('id') id: string) {
    return this.notificacionesService.readNotification(id);
  }

  @Post('socios')
  enviarNotificacionesSocios(@Body() dto: EnviarNotificacionDto, @Res() res) {
    this.logger.log(
      `POST /socios - Received notification request, type: ${dto.tipoDestinatario}`,
    );
    this.logger.debug(
      `POST /socios - Full payload: ${JSON.stringify(dto)}`,
    );

    const validTypes = Object.values(TipoDestinatario) as string[];
    if (!validTypes.includes(dto.tipoDestinatario as string)) {
      const errorMsg = `Invalid tipoDestinatario: "${dto.tipoDestinatario}". Valid values: ${validTypes.join(', ')}`;
      this.logger.warn(`POST /socios - ${errorMsg}`);
      return res.status(400).send({ error: errorMsg });
    }

    switch (dto.tipoDestinatario) {
      case TipoDestinatario.DEUDORES:
        return this.notificacionesService
          .enviarNotificacionDeudores(dto)
          .then((result) => {
            this.logger.log(`POST /socios [DEUDORES] - Success`);
            res.status(200).send({ data: result });
          })
          .catch((error) => {
            this.logger.error(
              `POST /socios [DEUDORES] - Error: ${error.message}`,
            );
            res.status(400).send({ error: error.message });
          });
      case TipoDestinatario.SOCIOS:
        return this.notificacionesService
          .enviarNotificacionSocios(dto)
          .then((result) => {
            this.logger.log(`POST /socios [SOCIOS] - Success`);
            res.status(200).send({ data: result });
          })
          .catch((error) => {
            this.logger.error(
              `POST /socios [SOCIOS] - Error: ${error.message}`,
            );
            res.status(400).send({ error: error.message });
          });
      case TipoDestinatario.ACTIVIDAD:
        return this.notificacionesService
          .enviarNotificacionActividad(dto)
          .then((result) => {
            this.logger.log(`POST /socios [ACTIVIDAD] - Success`);
            res.status(200).send({ data: result });
          })
          .catch((error) => {
            this.logger.error(
              `POST /socios [ACTIVIDAD] - Error: ${error.message}`,
            );
            res.status(400).send({ error: error.message });
          });
      case TipoDestinatario.TURNO_ACTIVIDAD:
        return this.notificacionesService
          .enviarNotificacionTurnoActividad(dto)
          .then((result) => {
            this.logger.log(`POST /socios [TURNO_ACTIVIDAD] - Success`);
            res.status(200).send({ data: result });
          })
          .catch((error) => {
            this.logger.error(
              `POST /socios [TURNO_ACTIVIDAD] - Error: ${error.message}`,
            );
            res.status(400).send({ error: error.message });
          });
      case TipoDestinatario.SOCIO:
        return this.notificacionesService
          .enviarNotificacionSocio(dto)
          .then((result) => {
            this.logger.log(`POST /socios [SOCIO] - Success`);
            res.status(200).send({ data: result });
          })
          .catch((error) => {
            this.logger.error(
              `POST /socios [SOCIO] - Error: ${error.message}`,
            );
            res.status(400).send({ error: error.message });
          });
    }
  }

  @Get('socios/:idUsuario')
  findAllByUser(@Param('idUsuario') idUser: string, @Res() res) {
    this.logger.log(`GET /socios/:idUsuario - Fetching all notifications for user ${idUser}`);
    this.notificacionesService
      .findAllByUser(idUser)
      .then((result) => {
        this.logger.log(`GET /socios/:idUsuario - Found ${result.length} notifications`);
        res.status(200).send({ data: result });
      })
      .catch((error) => {
        this.logger.error(
          `GET /socios/:idUsuario - Error: ${error.message}`,
        );
        res.status(400).send({ error: error.message });
      });
  }

  @Get('socios/:idUsuario/new')
  getUnreadNotifications(@Param('idUsuario') idUser: string, @Res() res) {
    this.logger.log(`GET /socios/:idUsuario/new - Fetching unread notifications for user ${idUser}`);
    this.notificacionesService
      .getUnreadNotifications(idUser)
      .then((result) => {
        this.logger.log(`GET /socios/:idUsuario/new - Found ${result.length} unread notifications`);
        res.status(200).send({ data: result });
      })
      .catch((error) => {
        this.logger.error(
          `GET /socios/:idUsuario/new - Error: ${error.message}`,
        );
        res.status(400).send({ error: error.message });
      });
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description:
      'Retorna el detalle de una notificación según el id proporcionado.',
    type: NotificationResponseSchema,
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /:id - Fetching notification ${id}`);
    try {
      const result = await this.notificacionesService.findOne(id);
      if (!result) {
        this.logger.warn(`GET /:id - Notification ${id} not found`);
      }
      return result;
    } catch (error) {
      this.logger.error(`GET /:id - Error: ${error.message}`);
      throw error;
    }
  }
}
