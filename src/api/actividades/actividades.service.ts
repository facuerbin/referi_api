import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { CreateActividadDto } from './dto/create.actividad.dto';
import { CreateEstadoActividadDto } from './dto/create.estado.actividad.dto';
import { CreateTipoActividadDto } from './dto/create.tipo.actividad.dto';
import { CreateTurnoActividadDto } from './dto/create.turno.actividad.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { Actividad } from './entities/actividad.entity';
import { ActividadOrganizacion } from './entities/actividad.organizacion.entity';
import { EstadoActividad } from './entities/estado.actividad.entity';
import { Horario, Dias } from './entities/horario.entity';
import { TipoActividad } from './entities/tipo.actividad.entity';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(Actividad)
    private actividadRepository: Repository<Actividad>,
    @InjectRepository(TipoActividad)
    private tipoActividadRepository: Repository<TipoActividad>,
    @InjectRepository(ActividadOrganizacion)
    private turnoRepository: Repository<ActividadOrganizacion>,
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
      turno: null,
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
      },
    });
  }

  findActividadByTipo(tipoActividad) {
    return this.actividadRepository.find({
      where: {
        tipo: { tipo: tipoActividad },
        fechaBaja: IsNull(),
      },
      relations: {
        organizacion: true,
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

    const espacio = this.organizacionesService.findOneEspacio(
      createTurnoActividadDto.idEspacio,
    );

    const estadoActividad = this.estadoActividadRepository.findOne({
      where: { estado: 'ACTIVO' },
    });

    const horarios = createTurnoActividadDto.horarios.map((horario) => {
      return this.findHorario(
        horario.diaSemana,
        horario.horaInicio,
        horario.minutosInicio,
        horario.duracion,
      );
    });

    return Promise.all([actividad, espacio, estadoActividad, ...horarios]).then(
      (results) => {
        return this.turnoRepository.save({
          cupo: createTurnoActividadDto.cupo,
          descripcion: createTurnoActividadDto.descripcion,
          actividad: results[0],
          espacio: results[1],
          estado: results[2],
          horarios: results.slice(3),
        });
      },
    );
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
        espacio: true,
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
        actividad: true,
        espacio: true,
        estado: true,
        horarios: true,
        inscriptos: true,
        tarifas: true,
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
        diaSemana: Dias[dia],
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

  update(id: number, updateActividadeDto: UpdateActividadeDto) {
    return `This action updates a #${id} actividade`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividade`;
  }
}
