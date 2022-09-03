import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadesService } from '../actividades/actividades.service';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateSocioDto } from './dto/create.socio.dto';
import { UpdateSocioDto } from './dto/update.socio.dto';
import {
  EstadoInscripcion,
  Estado,
} from './entities/estado.inscripcion.entity';
import { Inscripcion } from './entities/inscripcion.entity';
import { InscripcionEstado } from './entities/inscripcion.estado.entity';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(EstadoInscripcion)
    private estadoInscripcionRepository: Repository<EstadoInscripcion>,
    @InjectRepository(InscripcionEstado)
    private inscripcionEstadoRepository: Repository<InscripcionEstado>,
    private organizacionesService: OrganizacionesService,
    private actividadesService: ActividadesService,
    private usuariosService: UsuariosService,
  ) {}

  create(createSocioDto: CreateSocioDto) {
    const usuario = this.usuariosService.findOne(createSocioDto.idUsuario);

    const turnoActividad = this.actividadesService.detailTurno(
      createSocioDto.idActividadOrg,
    );

    const estado = this.estadoInscripcionRepository.findOneBy({
      nombre: Estado.ACTIVO,
    });

    if (!usuario || !turnoActividad || !estado) throw new Error();

    return Promise.all([usuario, turnoActividad, estado]).then((results) => {
      return this.inscripcionRepository.save({
        legajo: createSocioDto.legajo,
        actividad: results[1],
        usuario: results[0],
        estado: results[2],
        organizacion: results[1].actividad.organizacion,
      });
    });
  }

  findByOrg(idOrg: string) {
    return this.inscripcionRepository.find({
      where: {
        organizacion: { id: idOrg },
      },
      relations: {
        actividad: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  findByActividad(idActividad: string) {
    return this.inscripcionRepository.find({
      where: {
        actividad: { id: idActividad },
      },
      relations: {
        actividad: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  findOne(idInscripcion: string) {
    return this.inscripcionRepository.findOne({
      where: {
        id: idInscripcion,
      },
      relations: {
        actividad: true,
        organizacion: true,
      },
    });
  }

  update(id: number, updateSocioDto: UpdateSocioDto) {
    return `This action updates a #${id} socio`;
  }

  remove(id: number) {
    return `This action removes a #${id} socio`;
  }
}
