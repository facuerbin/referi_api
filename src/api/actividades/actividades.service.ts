import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { CreateActividadDto } from './dto/create.actividad.dto';
import { CreateEstadoActividadDto } from './dto/create.estado.actividad.dto';
import { CreateTipoActividadDto } from './dto/create.tipo.actividad.dto';
import { CreateTurnoActividadDto } from './dto/create.turno.actividad.dto';
import { UpdateActividadDto } from './dto/update.actividad.dto';
import { Actividad } from './entities/actividad.entity';
import { TurnoActividad } from './entities/turno.actividad.entity';
import { EstadoActividad } from './entities/estado.actividad.entity';
import { Horario, Dias } from './entities/horario.entity';
import { TipoActividad } from './entities/tipo.actividad.entity';
import { TurnoHorario } from './entities/turno.horario.entity';
import { Cuota } from '../pagos/entities/cuota.entity';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(Actividad)
    private actividadRepository: Repository<Actividad>,
    @InjectRepository(TipoActividad)
    private tipoActividadRepository: Repository<TipoActividad>,
    @InjectRepository(TurnoActividad)
    private turnoRepository: Repository<TurnoActividad>,
    @InjectRepository(TurnoHorario)
    private horariosTurnoRepository: Repository<TurnoHorario>,
    @InjectRepository(EstadoActividad)
    private estadoActividadRepository: Repository<EstadoActividad>,
    @InjectRepository(Horario)
    private horarioRepository: Repository<Horario>,
    private organizacionesService: OrganizacionesService,
  ) {}

  async createActividad(createActividadDto: CreateActividadDto) {
    const tipo = await this.tipoActividadRepository.findOne({
      where: {
        id: createActividadDto.idTipoActividad,
        fechaBaja: IsNull(),
      },
    });

    const organizacion = await this.organizacionesService.findOne(
      createActividadDto.idOrganizacion,
    );

    if (!tipo || !organizacion) throw new Error();

    return this.actividadRepository.save({
      nombre: createActividadDto.nombre,
      descripcion: createActividadDto.descripcion,
      organizacion: organizacion,
      tipo: tipo,
      cupo: createActividadDto.cupo,
      turno: null,
      imgUrl: 'uploads/placeholder.png',
    });
  }

  findActividadByOrg(idOrg) {
    return this.actividadRepository.find({
      where: {
        organizacion: { id: idOrg },
        fechaBaja: IsNull(),
      },
      relations: {
        tipo: true,
        turnos: { horarios: { horario: true } },
        tarifas: true,
      },
    });
  }

  findActividadByTipo(idTipoActividad) {
    return this.actividadRepository.find({
      where: {
        tipo: { id: idTipoActividad },
        fechaBaja: IsNull(),
        turnos: !IsNull(),
        tarifas: !IsNull(),
      },
      relations: {
        organizacion: true,
        tipo: true,
        turnos: true,
        tarifas: true,
      },
    });
  }

  createTipoActividad(createTipoActividadDto: CreateTipoActividadDto) {
    return this.tipoActividadRepository.save({
      tipo: createTipoActividadDto.nombre,
      imgUrl: createTipoActividadDto.imgUrl,
    });
  }

  listTipoActividad() {
    return this.tipoActividadRepository.find({
      where: { fechaBaja: IsNull() },
    });
  }

  createEstadoActividad(createEstadoActividadDto: CreateEstadoActividadDto) {
    return this.estadoActividadRepository.save({
      estado: createEstadoActividadDto.estado.toUpperCase(),
    });
  }

  listEstadoActividad() {
    return this.estadoActividadRepository.find({
      where: {
        fechaBaja: IsNull(),
      },
    });
  }

  createTurnoActividad(createTurnoActividadDto: CreateTurnoActividadDto) {
    const actividad = this.actividadRepository.findOne({
      where: { id: createTurnoActividadDto.idActividad },
    });

    const idEspacios = createTurnoActividadDto.horarios.map(
      (horario) => horario.idEspacio,
    );

    const uniqueIdEspacio = [...new Set(idEspacios)];

    const espacios = uniqueIdEspacio.map((id) => {
      return this.organizacionesService.findOneEspacio(id);
    });

    const estadoActividad = this.estadoActividadRepository.findOne({
      where: { estado: 'ACTIVO' },
    });

    const horarios = createTurnoActividadDto.horarios.map((horario) => {
      return this.findHorario(
        Dias[horario.dia],
        horario.horaInicio,
        horario.minutosInicio,
        horario.duracion,
      );
    });

    return Promise.all([
      actividad,
      Promise.all(espacios),
      estadoActividad,
      Promise.all(horarios),
    ]).then(async (results) => {
      const turno = await this.turnoRepository.save({
        actividad: results[0],
        estado: results[2],
        horarios: results[3],
      });

      results[3].forEach((horario) => {
        this.horariosTurnoRepository.save({
          turnoActividad: turno,
          espacio: results[1][0],
          horario: horario,
        });
      });
      return turno;
    });
  }

  findTurnos(idActividad: string) {
    if (!idActividad) throw new Error();

    return this.turnoRepository.find({
      where: {
        actividad: {
          id: idActividad,
        },
        fechaBaja: IsNull(),
      },
      relations: {
        actividad: true,
        horarios: { horario: true, espacio: true },
        estado: true,
      },
    });
  }

  detailTurno(idTurno: string) {
    return this.turnoRepository.findOne({
      where: {
        id: idTurno,
        fechaBaja: IsNull(),
      },
      relations: {
        actividad: {
          organizacion: true,
          tarifas: true,
        },
        estado: true,
        horarios: {
          espacio: true,
          horario: true,
        },
        inscriptos: true,
      },
    });
  }

  detailActividad(idActividad) {
    return this.actividadRepository.findOne({
      where: {
        id: idActividad,
        fechaBaja: IsNull(),
      },
      relations: {
        organizacion: true,
        tarifas: true,
        turnos: {
          inscriptos: true,
          horarios: { horario: true, espacio: true },
        },
        tipo: true,
      },
    });
  }

  async findHorario(
    dia: Dias,
    hora: number,
    minutos: number,
    duracion: number,
  ) {
    let horario = await this.horarioRepository.findOne({
      where: {
        diaSemana: dia,
        horaInicio: hora,
        minutosInicio: minutos,
        duracion: duracion,
      },
    });

    if (!horario) {
      horario = await this.horarioRepository.save({
        diaSemana: dia,
        horaInicio: hora,
        minutosInicio: minutos,
        duracion: duracion,
      });
    }

    return horario;
  }

  update(id: string, updateActividadDto: UpdateActividadDto) {
    return this.actividadRepository.save({
      id: id,
      ...updateActividadDto,
    });
  }

  remove(id: string) {
    return this.actividadRepository.softDelete(id);
  }

  async ingresosPorActividad(idActividad: string) {
    const actividad = await this.actividadRepository.findOne({
      where: {
        id: idActividad,
      },
      relations: {
        tarifas: {
          cuotas: {
            pago: true,
          },
        },
      },
      loadEagerRelations: true,
    });
    const tarifas = await actividad.tarifas;
    const cuotas: Cuota[] = [];
    tarifas.forEach((tarifa) => {
      cuotas.push(...tarifa.cuotas.filter((cuotaTarifa) => cuotaTarifa.pago));
    });

    return cuotas.reduce((acc, value) => acc + value.monto, 0);
  }

  async ingresosPorActividadPorOrganizacion(idOrganizacion: string) {
    const actividades = await this.actividadRepository.find({
      where: {
        organizacion: {
          id: idOrganizacion,
        },
      },
      relations: {
        tarifas: {
          cuotas: {
            pago: true,
          },
        },
      },
      loadEagerRelations: true,
    });
    return Promise.all(
      actividades.map(async (actividad) => {
        const tarifas = await actividad.tarifas;
        const cuotas: Cuota[] = [];

        tarifas.forEach((tarifa) => {
          cuotas.push(
            ...tarifa.cuotas.filter((cuotaTarifa) => cuotaTarifa.pago),
          );
        });
        const obj = {};
        obj[actividad.nombre] = cuotas.reduce(
          (acc, value) => acc + value.monto,
          0,
        );
        return obj;
      }),
    ).then((results) => {
      const obj = {};
      results.forEach(
        (result) =>
          (obj[Object.keys(result)[0]] = result[Object.keys(result)[0]]),
      );
      return obj;
    });
  }

  async deudaPorActividadPorOrganizacion(idOrganizacion: string) {
    const actividades = await this.actividadRepository.find({
      where: {
        organizacion: {
          id: idOrganizacion,
        },
      },
      relations: {
        tarifas: {
          cuotas: {
            pago: true,
          },
        },
      },
      loadEagerRelations: true,
    });
    return Promise.all(
      actividades.map(async (actividad) => {
        const tarifas = await actividad.tarifas;
        const cuotas: Cuota[] = [];

        tarifas.forEach((tarifa) => {
          cuotas.push(
            ...tarifa.cuotas.filter(
              (cuotaTarifa) =>
                !cuotaTarifa.pago &&
                new Date(cuotaTarifa.fechaVencimiento).getTime() > Date.now(),
            ),
          );
        });
        const obj = {};
        obj[actividad.nombre] = cuotas.reduce(
          (acc, value) => acc + value.monto,
          0,
        );
        return obj;
      }),
    ).then((results) => {
      const obj = {};
      results.forEach(
        (result) =>
          (obj[Object.keys(result)[0]] = result[Object.keys(result)[0]]),
      );
      return obj;
    });
  }
}
