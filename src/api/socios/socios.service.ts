import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadesService } from '../actividades/actividades.service';
import { PagosService } from '../pagos/pagos.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateSocioDto } from './dto/create.socio.dto';
import { UpdateSocioDto } from './dto/update.socio.dto';
import {
  EstadoInscripcion,
  Estado,
} from './entities/estado.inscripcion.entity';
import { Inscripcion } from './entities/inscripcion.entity';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
    @InjectRepository(EstadoInscripcion)
    private estadoInscripcionRepository: Repository<EstadoInscripcion>,
    private actividadesService: ActividadesService,
    private usuariosService: UsuariosService,
    @Inject(forwardRef(() => PagosService))
    private pagosService: PagosService,
  ) {}

  async create(createSocioDto: CreateSocioDto) {
    const usuario = this.usuariosService.findOne(createSocioDto.idUsuario);

    const turnoActividad = this.actividadesService.detailTurno(
      createSocioDto.idTurnoActividad,
    );

    const estado = this.estadoInscripcionRepository.findOneBy({
      nombre: Estado.ACTIVO,
    });

    if (!usuario || !turnoActividad || !estado) throw new Error();

    const inscripcion = await Promise.all([
      usuario,
      turnoActividad,
      estado,
    ]).then((results) => {
      return this.inscripcionRepository.save({
        turnoActividad: results[1],
        usuario: results[0],
        estado: results[2],
        organizacion: results[1].actividad.organizacion,
      });
    });

    const cuotas = await this.pagosService.createCuotas(inscripcion);

    return inscripcion;
  }

  findByOrg(idOrg: string) {
    return this.inscripcionRepository.find({
      where: {
        organizacion: { id: idOrg },
      },
      relations: {
        turnoActividad: { actividad: true },
        usuario: true,
        estados: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  findByUser(idUser: string) {
    return this.inscripcionRepository.find({
      where: {
        usuario: { id: idUser },
      },
      relations: {
        turnoActividad: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  findByActividad(idActividad: string) {
    return this.inscripcionRepository.find({
      where: {
        turnoActividad: { id: idActividad },
      },
      relations: {
        turnoActividad: { actividad: true },
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
        turnoActividad: { actividad: true },
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
