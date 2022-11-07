import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoOrganizacion } from '../organizaciones/entities/tipo.organizacion.entity';
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

  findOne(id: number) {
    return `This action returns a #${id} notificacione`;
  }

  update(id: number, updateNotificacioneDto: UpdateNotificacioneDto) {
    return `This action updates a #${id} notificacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} notificacione`;
  }

  // enviarNotificacion(dto: EnviarNotifiacionDto) {}

  enviarNotificacionDeudores(dto: EnviarNotifiacionDto) {
    this.sociosService.findDeudoresByOrg(dto.idRemitente);
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
