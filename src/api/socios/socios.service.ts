import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindManyOptions,
  IsNull,
  LessThan,
  Repository,
} from 'typeorm';
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
import * as csv from 'csv-writer';
import * as moment from 'moment';
import { ReporteInscriptosActividadMesDto } from './dto/reporte.inscriptos.actividad.mes.dto';
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

  async findByOrg(idOrg: string) {
    const socios = await this.inscripcionRepository.find({
      where: {
        organizacion: { id: idOrg },
      },
      relations: {
        turnoActividad: { actividad: true },
        usuario: true,
        estados: true,
        cuotas: { pago: true },
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });

    const today = moment();
    const deudores = socios.filter((socio) => {
      return (
        socio.cuotas.find((cuota) => {
          return today.isAfter(cuota.fechaVencimiento) && !cuota.pago;
        }) && !socio.fechaBaja
      );
    });

    const alDia = socios.filter((socio) => {
      return (
        socio.cuotas.filter((cuota) => {
          return (
            (today.isSameOrBefore(cuota.fechaVencimiento) || cuota.pago) &&
            !socio.fechaBaja
          );
        }).length == socio.cuotas.length
      );
    });

    const estadoDeudor = await this.estadoInscripcionRepository.findOne({
      where: { nombre: Estado.DEUDOR },
    });

    const estadoActivo = await this.estadoInscripcionRepository.findOne({
      where: { nombre: Estado.ACTIVO },
    });

    const estadoInactivo = await this.estadoInscripcionRepository.findOne({
      where: { nombre: Estado.INACTIVO },
    });

    deudores.forEach(async (deudor) => {
      const inactividad = deudor.cuotas.find((cuota) => {
        return today.isAfter(moment(cuota.fechaVencimiento).add(1, 'month'));
      });

      if (deudor.estados[0].nombre == Estado.DEUDOR) return '';

      deudor.estados = [estadoDeudor];
      if (inactividad) deudor.estados = [estadoInactivo];
      await this.inscripcionRepository.save(deudor);
    });

    alDia.forEach(async (socio) => {
      if (socio.estados[0]?.nombre == Estado.ACTIVO) return '';
      socio.estados = [estadoActivo];
      await this.inscripcionRepository.save(socio);
    });

    return socios;
  }

  async backupSociosByOrg(idOrg: string) {
    const socios = await this.inscripcionRepository.find({
      where: {
        organizacion: { id: idOrg },
      },
      relations: {
        turnoActividad: true,
        usuario: true,
        estados: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });

    const mapedSocios = socios.map((socio) => {
      return {
        id: socio.id,
        fechaBaja: socio.fechaBaja,
        idUsuario: socio.usuario.id,
        idActividadOrganizacion: socio.turnoActividad.id,
      };
    });

    if (!mapedSocios) return new Error('No se encontraron socios');
    const stringyfier = csv.createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'fechaBaja', title: 'FECHA_BAJA' },
        { id: 'idUsuario', title: 'ID_USUARIO' },
        { id: 'idActividadOrganizacion', title: 'ID_ACTIVIDAD_ORGANIZACION' },
      ],
    });

    const response =
      stringyfier.getHeaderString() +
      (await stringyfier.stringifyRecords(mapedSocios));
    return response;
  }

  async restoreSociosOrg(csvArray: string[][]) {
    const restoredArray = csvArray.map((row) => {
      return {
        id: row[0],
        idUsuario: row[2],
        idTurnoActividad: row[3],
        fechaBaja: row[1],
      };
    });
    restoredArray.shift();

    restoredArray.forEach((registry) => {
      const user = this.usuariosService.findOne(registry.idUsuario);
      const turnActividad = this.actividadesService.detailTurno(
        registry.idTurnoActividad,
      );
      Promise.all([user, turnActividad])
        .then((results) => {
          const inscripcion: Partial<Inscripcion> = {
            id: registry.id,
            usuario: results[0],
            fechaBaja: null,
            turnoActividad: results[1],
            organizacion: results[1].actividad.organizacion,
          };
          if (registry.fechaBaja)
            inscripcion.fechaBaja = new Date(registry.fechaBaja);
          this.inscripcionRepository.save(inscripcion);
        })
        .catch((e) => new Error());
    });
    return csvArray;
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

  async inscriptosPorMes(reporteDto: ReporteInscriptosMesDto) {
    const dbQuery: FindManyOptions<Inscripcion> = {
      where: {
        organizacion: { id: reporteDto.idOrganizacion },
        fechaCreacion: Between(
          new Date(reporteDto.fromYear, reporteDto.fromMonth - 1),
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
    };

    const inscriptos = await this.inscripcionRepository.find(dbQuery);

    const response = inscriptos.map((inscripto) => {
      return inscripto.fechaCreacion.toISOString().slice(0, 7);
    });
    const counts = {};
    response.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }

  async rangoEtarioSociosOrganizacion(idOrg: string) {
    const socios = await this.inscripcionRepository.find({
      where: {
        organizacion: { id: idOrg },
        fechaBaja: IsNull(),
      },
      relations: { usuario: true },
    });

    const response = socios.map((socio) => {
      return (
        Math.floor(moment().diff(socio.usuario.fechaNacimiento, 'years') / 10) *
        10
      );
    });
    const counts = {};
    response.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }

  async sociosPorEstadoOrganizacion(idOrg: string) {
    const dbQuery: FindManyOptions<Inscripcion> = {
      where: {
        organizacion: { id: idOrg },
        fechaBaja: IsNull(),
      },
      relations: { estados: true },
    };

    const socios = await this.inscripcionRepository.find(dbQuery);

    const response = socios.map((socio) => {
      if (socio.estados[0]) return socio.estados[0]?.nombre;
    });
    const counts = {};
    response.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }

  async inscriptosPorActividadPorMes(
    reporteDto: ReporteInscriptosActividadMesDto,
  ) {
    const dbQuery: FindManyOptions<Inscripcion> = {
      where: {
        turnoActividad: {
          actividad: { id: reporteDto.idActividad },
        },
        fechaCreacion: Between(
          new Date(reporteDto.fromYear, reporteDto.fromMonth - 1),
          new Date(reporteDto.toYear, reporteDto.toMonth, -1),
        ),
      },
      relations: {
        turnoActividad: { actividad: true },
        usuario: true,
      },
      order: {
        fechaCreacion: 'DESC',
      },
    };

    const inscriptos = await this.inscripcionRepository.find(dbQuery);

    const response = inscriptos.map((inscripto) => {
      return inscripto.fechaCreacion.toISOString().slice(0, 7);
    });
    const counts = {};
    response.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }

  async rangoEtarioSociosActividad(idActividad: string) {
    const socios = await this.inscripcionRepository.find({
      where: {
        turnoActividad: { actividad: { id: idActividad } },
        fechaBaja: IsNull(),
      },
      relations: { usuario: true },
    });

    const response = socios.map((socio) => {
      return (
        Math.floor(moment().diff(socio.usuario.fechaNacimiento, 'years') / 10) *
        10
      );
    });
    const counts = {};
    response.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }
}
