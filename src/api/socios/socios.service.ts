import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, LessThan, Repository } from 'typeorm';
import { ActividadesService } from '../actividades/actividades.service';
import { PagosService } from '../pagos/pagos.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateSocioDto } from './dto/create.socio.dto';
import { ReporteInscriptosMesDto } from './dto/reporte.inscriptos.mes.dto';
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

    if (!usuario) throw new Error('Usuario no encontrado');
    if (!turnoActividad) throw new Error('No se encontró el turno solicitado');
    if (!estado) throw new Error('Error interno, intente más tarde');

    const inscripcion = await Promise.all([
      usuario,
      turnoActividad,
      estado,
    ]).then(async (results) => {
      const yaInscripto = await this.inscripcionRepository.findOne({
        where: {
          fechaBaja: IsNull(),
          usuario: { id: results[0].id },
          turnoActividad: { id: results[1].id },
        },
      });
      if (yaInscripto)
        throw new Error(
          'El usuario ya se encuentra inscripto en el turno solicitado',
        );
      return this.inscripcionRepository.save({
        turnoActividad: results[1],
        usuario: results[0],
        estados: [results[2]],
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

  findDeudoresByOrg(idOrg: string) {
    return this.inscripcionRepository.find({
      where: {
        organizacion: { id: idOrg },
        cuotas: { pago: null, fechaVencimiento: LessThan(new Date()) },
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
        turnoActividad: {
          actividad: true,
          horarios: { espacio: true, horario: true },
        },
        organizacion: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  findByTurnoActividad(idTurnoActividad: string) {
    return this.inscripcionRepository.find({
      where: {
        turnoActividad: { id: idTurnoActividad },
      },
      relations: {
        turnoActividad: { actividad: true },
        usuario: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  findByActividad(idActividad: string) {
    return this.inscripcionRepository.find({
      where: {
        turnoActividad: {
          actividad: { id: idActividad },
        },
      },
      relations: {
        turnoActividad: { actividad: true },
        usuario: true,
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
        estados: true,
        cuotas: true,
        usuario: true,
      },
    });
  }

  update(id: number, updateSocioDto: UpdateSocioDto) {
    return `This action updates a #${id} socio`;
  }

  async remove(id: string) {
    const socio = await this.findOne(id);
    if (socio.estados[0].nombre != Estado.ACTIVO.toUpperCase()) {
      console.log(socio);
      return new Error(
        'El inscripto no puede ser dado de baja hasta que esté en estado Activo',
      );
    }
    const baja = await this.estadoInscripcionRepository.findOne({
      where: { nombre: Estado.BAJA },
    });
    socio.fechaBaja = new Date();
    socio.estados = [baja];
    return this.inscripcionRepository.save(socio);
  }

  inscriptosPorMes(reporteDto: ReporteInscriptosMesDto) {
    return this.inscripcionRepository.find({
      where: {
        organizacion: { id: reporteDto.idOrganizacion },
        fechaCreacion: Between(
          new Date(reporteDto.fromYear, reporteDto.fromMonth - 1, 1),
          new Date(reporteDto.toYear, reporteDto.toMonth, -1),
        ),
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
}
