import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { CreateActividadDto } from './dto/create.actividad.dto';
import { CreateEstadoActividadDto } from './dto/create.estado.actividad.dto';
import { CreateTipoActividadDto } from './dto/create.tipo.actividad.dto';
import { CreateTurnoActividadDto } from './dto/create.turno.actividad.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { Actividad } from './entities/actividad.entity';
import { ActividadOrganizacion } from './entities/actividad.organizacion.entity';
import { EstadoActividad } from './entities/estado.actividad.entity';
import { Horario } from './entities/horario.entity';
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
        isActive: true,
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
      where: { isActive: true },
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
        isActive: true,
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

    // const horario = this.horarioRepository.findOne()

    return Promise.all([actividad, espacio, estadoActividad]).then(
      (results) => {
        return this.turnoRepository.save({
          cupo: createTurnoActividadDto.cupo,
          descripcion: createTurnoActividadDto.descripcion,
          actividad: results[0],
          espacio: results[1],
          estado: results[2],
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
        isActive: true,
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

  update(id: number, updateActividadeDto: UpdateActividadeDto) {
    return `This action updates a #${id} actividade`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividade`;
  }
}
