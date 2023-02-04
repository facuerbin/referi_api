import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { SociosService } from '../socios/socios.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EnviarNotifiacionDto } from './dto/enviar.notificacion.dto';
import {
  Notificacion,
  TipoDestinatario,
  TipoRemitente,
} from './entities/notificacion.entity';
import { NotificacionUsuario } from './entities/notificaciones.usuario.entity';

@Injectable()
export class NotificacionesService {
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
    const userNotification = await this.notificacionUsuarioRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        notificacion: true,
      },
    });
    userNotification.fechaLectura = new Date();
    return this.notificacionUsuarioRepository.save(userNotification);
  }

  findOne(id: string) {
    return this.notificacionRepository.findOne({
      where: {
        id,
      },
      relations: {
        destinatarios: { destinatario: true },
      },
    });
  }

  async enviarNotificacionDeudores(dto: EnviarNotifiacionDto) {
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

        users.forEach((user) => {
          this.notificacionUsuarioRepository.save({
            notificacion: notificacion,
            destinatario: user,
          });
        });

        return notificacion;
      })
      .catch((e) => e);
  }

  async enviarNotificacionSocios(dto: EnviarNotifiacionDto) {
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

    this.getUniqueUsers(usuarios).forEach((user) => {
      this.notificacionUsuarioRepository.save({
        destinatario: user,
        notificacion: notif,
      });
    });

    return notif;
  }

  async enviarNotificacionActividad(dto: EnviarNotifiacionDto) {
    if (!dto.idDestinatario) return new Error('No se encontró el destinatario');
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

    this.getUniqueUsers(usuarios).forEach((user) => {
      this.notificacionUsuarioRepository.save({
        destinatario: user,
        notificacion: notif,
      });
    });

    return notif;
  }

  async enviarNotificacionTurnoActividad(dto: EnviarNotifiacionDto) {
    if (!dto.idDestinatario) return new Error('No se encontró el destinatario');
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
      tipoDestinatario: TipoDestinatario.ACTIVIDAD,
    });

    this.getUniqueUsers(usuarios).forEach((user) => {
      this.notificacionUsuarioRepository.save({
        destinatario: user,
        notificacion: notif,
      });
    });

    return notif;
  }

  async enviarNotificacionSocio(dto: EnviarNotifiacionDto) {
    if (!dto.idDestinatario) return new Error('No se encontró el destinatario');
    const remitente = await this.organizacionService.findOne(dto.idRemitente);
    const usuario = await this.usuariosService.findOne(dto.idDestinatario);
    const notif = await this.notificacionRepository.save({
      titulo: dto.titulo,
      cuerpo: dto.cuerpo,
      fecha: new Date().toISOString(),
      idRemitente: dto.idRemitente,
      nombreRemitente: remitente.nombre,
      tipoRemitente: TipoRemitente.ORGANIZACION,
      tipoDestinatario: TipoDestinatario.ACTIVIDAD,
    });

    this.notificacionUsuarioRepository.save({
      destinatario: usuario,
      notificacion: notif,
    });

    return notif;
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
