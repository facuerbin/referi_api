import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Organizacion } from '../organizaciones/entities/organizacion.entity';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';
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
    private usuariosService: UsuariosService,
  ) {}

  async registerAttendance(createAsistenciaDto: CreateAsistenciaDto) {
    const organizacion = await this.getOrganizacion(createAsistenciaDto.idOrg);
    const planilla = await this.getPlanilla(organizacion);

    return this.asistenteRepository.save({
      hora: new Date(),
      dni: createAsistenciaDto.dni,
      nombre: createAsistenciaDto.nombre,
      apellido: createAsistenciaDto.apellido,
      planilla: planilla,
    });
  }

  async registerAttendanceWithEmail(createAsistenciaDto: CreateAsistenciaDto) {
    const organizacion = await this.getOrganizacion(createAsistenciaDto.idOrg);
    const planilla = this.getPlanilla(organizacion);
    const usuario = this.usuariosService.findByEmail(
      createAsistenciaDto.emailUsuario,
    );

    Promise.all([planilla, usuario]).then((result) => {
      const planilla = result[0];
      const usuario = result[1];
      return this.asistenteRepository.save({
        hora: new Date(),
        dni: usuario.dni,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        usuarioId: usuario.id,
        planilla: planilla,
        idUsuario: usuario.id,
      });
    });
  }

  async registerAppAttendance(idOrg: string, idUsuario: string) {
    const organizacion = await this.getOrganizacion(idOrg);
    const planilla = this.getPlanilla(organizacion);
    const usuario = this.usuariosService.findOne(idUsuario);

    return Promise.all([planilla, usuario]).then((result) => {
      const planilla = result[0];
      const usuario = result[1];
      return this.asistenteRepository.save({
        hora: new Date(),
        dni: usuario.dni,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        planilla: planilla,
        idUsuario: usuario.id,
      });
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

  findOne(fecha: Date, idOrg: string) {
    const date = new Date(fecha);
    return this.planillaRepository.findOne({
      where: {
        fecha: new Date(date.setUTCHours(0, 0, 0, 0)),
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

  async getPlanilla(organizacion: Organizacion) {
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
    return planillaDb;
  }

  async getOrganizacion(idOrg: string) {
    return this.organizacionesService.findOne(idOrg);
  }
}
