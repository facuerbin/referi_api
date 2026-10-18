import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
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
    @InjectRepository(Inscripcion)
    private inscripcionRepository: Repository<Inscripcion>,
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

    return Promise.all([planilla, usuario]).then((result) => {
      const planilla = result[0];
      const usuario = result[1];
      if (!usuario) {
        throw new NotFoundException('No existe un usuario con ese email');
      }
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
    await this.assertInscripto(idUsuario, idOrg);

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

  // The QR proves which organización was scanned, not who scanned it.
  private async assertInscripto(idUsuario: string, idOrg: string) {
    const inscripciones = await this.inscripcionRepository.count({
      where: { usuario: { id: idUsuario }, organizacion: { id: idOrg } },
    });

    if (!inscripciones) {
      throw new ForbiddenException('No está inscripto en esta organización');
    }
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
