import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ListPlanillaDto } from './dto/list.planilla.dto';
import { Asistente } from './entities/asistente.entity';
import { PlanillaAsistencia } from './entities/planilla.asistencia.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistente)
    private asistenteRepository: Repository<Asistente>,
    @InjectRepository(PlanillaAsistencia)
    private planillaRepository: Repository<PlanillaAsistencia>,
    private organizacionesService: OrganizacionesService,
  ) {}

  async create(createAsistenciaDto: CreateAsistenciaDto) {
    const organizacion = await this.organizacionesService.findOne(
      createAsistenciaDto.idOrg,
    );

    const now = new Date();
    const planilla = {
      fecha: new Date(now.setUTCHours(0, 0, 0, 0)),
      organizacion: organizacion,
    };

    const planillaDb =
      (await this.planillaRepository.findOne({
        where: {
          fecha: planilla.fecha,
          organizacion: { id: planilla.organizacion.id },
        },
        relations: {
          organizacion: true,
        },
      })) ?? (await this.planillaRepository.save(planilla));

    return this.asistenteRepository.save({
      hora: new Date(),
      dni: createAsistenciaDto.dni,
      nombre: createAsistenciaDto.nombre,
      apellido: createAsistenciaDto.apellido,
      planilla: planillaDb,
    });
  }

  findAll(listPlanillaDto: ListPlanillaDto) {
    return this.planillaRepository.find({
      where: {
        organizacion: {
          id: listPlanillaDto.idOrg,
        },
        fecha: Between(
          new Date(listPlanillaDto.fechaDesde),
          new Date(listPlanillaDto.fechaHasta),
        ),
      },
      relations: {
        asistentes: true,
      },
    });
  }

  findOne(id: string, idOrg: string) {
    return this.planillaRepository.findOne({
      where: {
        id: id,
        organizacion: {
          id: idOrg,
        },
      },
      relations: {
        organizacion: true,
        asistentes: true,
      },
    });
  }
}
