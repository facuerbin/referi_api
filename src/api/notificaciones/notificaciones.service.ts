import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { SociosService } from '../socios/socios.service';
import { CreateNotificacioneDto } from './dto/create-notificacione.dto';
import { EnviarNotifiacionDto } from './dto/enviar.notificacion.dto';
import { UpdateNotificacioneDto } from './dto/update-notificacione.dto';
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

  findAll() {
    return `This action returns all notificaciones`;
  }

  findAllByUser(idUser) {
    // subjectRepo
    // .createQueryBuilder('subject')
    // .leftJoin('subject.notes', 'note')
    // .where('note.id = :id', { id: note.id })
    // .getMany();
    return this.notificacionRepository
      .createQueryBuilder('notificaciones')
      .leftJoin('notificaciones.usuarios', 'usuario')
      .where('usuario.id = :id', { id: idUser })
      .getMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} notificacione`;
  }

  update(id: number, updateNotificacioneDto: UpdateNotificacioneDto) {
    return `This action updates a #${id} notificacione`;
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
          usuarios: result[0].map((inscripcion) => inscripcion.usuario),
        };

        return this.notificacionRepository.save(notificacion);
      })
      .catch((e) => e);
  }

  async enviarNotificacionSocios(dto: EnviarNotifiacionDto) {
    const socios = await this.sociosService.findByOrg(dto.idRemitente);
    const usuarios = socios.map((socio) => socio.usuario);
    const notif = await this.notificacionRepository.save({
      titulo: dto.titulo,
      cuerpo: dto.cuerpo,
      fecha: dto.fecha,
      idRemitente: dto.idRemitente,
      nombreRemitente: 'Regatas',
      tipoRemitente: TipoRemitente.ORGANIZACION,
      tipoDestinatario: TipoDestinatario.SOCIOS,
      usuarios: [...usuarios],
    });
    return notif;
  }
}
