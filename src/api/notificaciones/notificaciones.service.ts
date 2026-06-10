import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { SociosService } from '../socios/socios.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EnviarNotificacionDto } from './dto/enviar.notificacion.dto';
import {
  Notificacion,
  TipoDestinatario,
  TipoRemitente,
} from './entities/notificacion.entity';
import { NotificacionUsuario } from './entities/notificaciones.usuario.entity';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
    @InjectRepository(NotificacionUsuario)
    private notificacionUsuarioRepository: Repository<NotificacionUsuario>,
    private sociosService: SociosService,
    private usuariosService: UsuariosService,
    private organizacionService: OrganizacionesService,
  ) {}

  findAllByUser(idUser) {
    this.logger.debug(`[FIND_ALL] Fetching all notifications for user ${idUser}`);
    return this.notificacionUsuarioRepository.find({
      where: {
        destinatario: { id: idUser },
      },
      relations: {
        notificacion: true,
      },
    });
  }

  getUnreadNotifications(idUser) {
    this.logger.debug(`[UNREAD] Fetching unread notifications for user ${idUser}`);
    return this.notificacionUsuarioRepository.find({
      where: {
        destinatario: { id: idUser },
        fechaLectura: IsNull(),
      },
      relations: {
        notificacion: true,
      },
    });
  }

  async readNotification(id) {
    try {
      this.logger.log(`[READ] Marking notification ${id} as read`);
      const userNotification = await this.notificacionUsuarioRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          notificacion: true,
        },
      });
      if (!userNotification) {
        this.logger.warn(`[READ] Notification ${id} not found`);
        throw new Error('Notification not found');
      }
      userNotification.fechaLectura = new Date();
      const result = await this.notificacionUsuarioRepository.save(userNotification);
      this.logger.log(`[READ] Successfully marked notification ${id} as read`);
      return result;
    } catch (error) {
      this.logger.error(
        `[READ] Failed to mark notification as read: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  findOne(id: string) {
    this.logger.debug(`[FIND_ONE] Fetching notification ${id}`);
    return this.notificacionRepository.findOne({
      where: {
        id,
      },
      relations: {
        destinatarios: { destinatario: true },
      },
    });
  }

  async enviarNotificacionDeudores(dto: EnviarNotificacionDto) {
    try {
      this.logger.log(
        `[DEUDORES] Sending notification to debtors of org ${dto.idRemitente}: "${dto.titulo}"`,
      );
      const destinatarios = this.sociosService.findDeudoresByOrg(dto.idRemitente);
      const remitente = this.organizacionService.findOne(dto.idRemitente);

      return Promise.all([destinatarios, remitente])
        .then(async (result) => {
          const notificacion = await this.notificacionRepository.save({
            idRemitente: result[1].id,
            nombreRemitente: result[1].nombre,
            tipoRemitente: TipoRemitente.ORGANIZACION,
            tipoDestinatario: TipoDestinatario.DEUDORES,
            titulo: dto.titulo,
            cuerpo: dto.cuerpo,
            fecha: new Date(),
          });

          const users = this.getUniqueUsers(
            result[0].map((inscripcion) => inscripcion.usuario),
          );

          this.logger.log(
            `[DEUDORES] Created notification ${notificacion.id} for ${users.length} unique debtors`,
          );

          users.forEach((user) => {
            this.notificacionUsuarioRepository.save({
              notificacion: notificacion,
              destinatario: user,
            });
          });

          return notificacion;
        })
        .catch((e) => {
          this.logger.error(
            `[DEUDORES] Failed to send notification: ${e.message}`,
            e.stack,
          );
          throw e;
        });
    } catch (error) {
      this.logger.error(
        `[DEUDORES] Unexpected error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async enviarNotificacionSocios(dto: EnviarNotificacionDto) {
    try {
      this.logger.log(
        `[SOCIOS] Sending notification to all members of org ${dto.idRemitente}: "${dto.titulo}"`,
      );
      const socios = await this.sociosService.findByOrg(dto.idRemitente);
      const remitente = await this.organizacionService.findOne(dto.idRemitente);
      const usuarios = socios.map((socio) => socio.usuario);
      const notif = await this.notificacionRepository.save({
        titulo: dto.titulo,
        cuerpo: dto.cuerpo,
        fecha: new Date().toISOString(),
        idRemitente: dto.idRemitente,
        nombreRemitente: remitente.nombre,
        tipoRemitente: TipoRemitente.ORGANIZACION,
        tipoDestinatario: TipoDestinatario.SOCIOS,
      });

      const uniqueUsers = this.getUniqueUsers(usuarios);
      this.logger.log(
        `[SOCIOS] Created notification ${notif.id} for ${uniqueUsers.length} unique members`,
      );

      uniqueUsers.forEach((user) => {
        this.notificacionUsuarioRepository.save({
          destinatario: user,
          notificacion: notif,
        });
      });

      return notif;
    } catch (error) {
      this.logger.error(
        `[SOCIOS] Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async enviarNotificacionActividad(dto: EnviarNotificacionDto) {
    try {
      if (!dto.idDestinatario) {
        this.logger.warn(
          `[ACTIVIDAD] Missing idDestinatario for notification: "${dto.titulo}"`,
        );
        throw new Error('No se encontró el destinatario');
      }
      this.logger.log(
        `[ACTIVIDAD] Sending notification to activity ${dto.idDestinatario}: "${dto.titulo}"`,
      );
      const remitente = await this.organizacionService.findOne(dto.idRemitente);
      const socios = await this.sociosService.findByActividad(dto.idDestinatario);
      const usuarios = socios.map((socio) => socio.usuario);
      const notif = await this.notificacionRepository.save({
        titulo: dto.titulo,
        cuerpo: dto.cuerpo,
        fecha: new Date().toISOString(),
        idRemitente: dto.idRemitente,
        nombreRemitente: remitente.nombre,
        tipoRemitente: TipoRemitente.ORGANIZACION,
        tipoDestinatario: TipoDestinatario.ACTIVIDAD,
      });

      const uniqueUsers = this.getUniqueUsers(usuarios);
      this.logger.log(
        `[ACTIVIDAD] Created notification ${notif.id} for ${uniqueUsers.length} unique members in activity`,
      );

      uniqueUsers.forEach((user) => {
        this.notificacionUsuarioRepository.save({
          destinatario: user,
          notificacion: notif,
        });
      });

      return notif;
    } catch (error) {
      this.logger.error(
        `[ACTIVIDAD] Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async enviarNotificacionTurnoActividad(dto: EnviarNotificacionDto) {
    try {
      if (!dto.idDestinatario) {
        this.logger.warn(
          `[TURNO_ACTIVIDAD] Missing idDestinatario for notification: "${dto.titulo}"`,
        );
        throw new Error('No se encontró el destinatario');
      }
      this.logger.log(
        `[TURNO_ACTIVIDAD] Sending notification to shift ${dto.idDestinatario}: "${dto.titulo}"`,
      );
      const remitente = await this.organizacionService.findOne(dto.idRemitente);
      const socios = await this.sociosService.findByTurnoActividad(
        dto.idDestinatario,
      );
      const usuarios = socios.map((socio) => socio.usuario);
      const notif = await this.notificacionRepository.save({
        titulo: dto.titulo,
        cuerpo: dto.cuerpo,
        fecha: new Date().toISOString(),
        idRemitente: dto.idRemitente,
        nombreRemitente: remitente.nombre,
        tipoRemitente: TipoRemitente.ORGANIZACION,
        tipoDestinatario: TipoDestinatario.TURNO_ACTIVIDAD,
      });

      const uniqueUsers = this.getUniqueUsers(usuarios);
      this.logger.log(
        `[TURNO_ACTIVIDAD] Created notification ${notif.id} for ${uniqueUsers.length} unique members in shift`,
      );

      uniqueUsers.forEach((user) => {
        this.notificacionUsuarioRepository.save({
          destinatario: user,
          notificacion: notif,
        });
      });

      return notif;
    } catch (error) {
      this.logger.error(
        `[TURNO_ACTIVIDAD] Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async enviarNotificacionSocio(dto: EnviarNotificacionDto) {
    try {
      if (!dto.idDestinatario) {
        this.logger.warn(
          `[SOCIO] Missing idDestinatario for notification: "${dto.titulo}"`,
        );
        throw new Error('No se encontró el destinatario');
      }
      this.logger.log(
        `[SOCIO] Sending notification to user ${dto.idDestinatario}: "${dto.titulo}"`,
      );
      const remitente = await this.organizacionService.findOne(dto.idRemitente);
      const usuario = await this.usuariosService.findOne(dto.idDestinatario);
      const notif = await this.notificacionRepository.save({
        titulo: dto.titulo,
        cuerpo: dto.cuerpo,
        fecha: new Date().toISOString(),
        idRemitente: dto.idRemitente,
        nombreRemitente: remitente.nombre,
        tipoRemitente: TipoRemitente.ORGANIZACION,
        tipoDestinatario: TipoDestinatario.SOCIO,
      });

      this.logger.log(
        `[SOCIO] Created notification ${notif.id} for member ${usuario.email}`,
      );

      this.notificacionUsuarioRepository.save({
        destinatario: usuario,
        notificacion: notif,
      });

      return notif;
    } catch (error) {
      this.logger.error(
        `[SOCIO] Failed to send notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getUniqueUsers(users: Usuario[]) {
    const uniqueUsers: Usuario[] = [];
    users.forEach((user) => {
      const found = uniqueUsers.find((element) => {
        return user.email == element.email;
      });

      if (!found) uniqueUsers.push(user);
    });

    return uniqueUsers;
  }
}
