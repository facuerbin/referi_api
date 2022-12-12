import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { SociosService } from '../socios/socios.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { EnviarNotifiacionDto } from './dto/enviar.notificacion.dto';
import {
  Notificacion,
  TipoDestinatario,
  TipoRemitente,
} from './entities/notificacion.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
    private sociosService: SociosService,
    private organizacionService: OrganizacionesService,
  ) {}
  create(createNotificacioneDto: CreateNotificacioneDto) {
    return 'This action adds a new notificacione';
  }

  findAllByUser(idUser) {
    return this.notificacionRepository
      .createQueryBuilder('notificaciones')
      .leftJoin('notificaciones.usuarios', 'usuario')
      .where('usuario.id = :id', { id: idUser })
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} notificacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificacione`;
  }

  async enviarNotificacionDeudores(dto: EnviarNotifiacionDto) {
    const destinatarios = this.sociosService.findDeudoresByOrg(dto.idRemitente);
    const remitente = this.organizacionService.findOne(dto.idRemitente);

    return Promise.all([destinatarios, remitente])
      .then((result) => {
        const notificacion: Partial<Notificacion> = {
          idRemitente: result[1].id,
          nombreRemitente: result[1].nombre,
          tipoRemitente: TipoRemitente.ORGANIZACION,
          tipoDestinatario: TipoDestinatario.DEUDORES,
          titulo: dto.titulo,
          cuerpo: dto.cuerpo,
          fecha: new Date(),
          usuarios: this.getUniqueUsers(
            result[0].map((inscripcion) => inscripcion.usuario),
          ),
        };

        return this.notificacionRepository.save(notificacion);
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
      usuarios: this.getUniqueUsers(usuarios),
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
      usuarios: this.getUniqueUsers(usuarios),
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
      usuarios: this.getUniqueUsers(usuarios),
    });
    return notif;
  }

  async enviarNotificacionSocio(dto: EnviarNotifiacionDto) {
    if (!dto.idDestinatario) return new Error('No se encontró el destinatario');
    const remitente = await this.organizacionService.findOne(dto.idRemitente);
    const socio = await this.sociosService.findByUser(dto.idDestinatario);
    const usuario = socio[0].usuario;
    const notif = await this.notificacionRepository.save({
      titulo: dto.titulo,
      cuerpo: dto.cuerpo,
      fecha: new Date().toISOString(),
      idRemitente: dto.idRemitente,
      nombreRemitente: remitente.nombre,
      tipoRemitente: TipoRemitente.ORGANIZACION,
      tipoDestinatario: TipoDestinatario.ACTIVIDAD,
      usuarios: [usuario],
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
