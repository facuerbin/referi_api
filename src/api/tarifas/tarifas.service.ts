import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ActividadOrganizacion } from '../actividades/entities/actividad.organizacion.entity';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { CreateFrecuenciaDto } from './dto/create.frecuencia.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { Frecuencia } from './entities/frecuencia.entity';
import { TarifaActividad } from './entities/tarifa.actividad.entity';
import { Tarifa } from './entities/tarifa.entity';

@Injectable()
export class TarifasService {
  constructor(
    @InjectRepository(Tarifa) private tarifaRepository: Repository<Tarifa>,
    @InjectRepository(TarifaActividad)
    private tarifaActividadRepository: Repository<TarifaActividad>,
    @InjectRepository(Frecuencia)
    private frecuenciaRepository: Repository<Frecuencia>,
    private organizacionesService: OrganizacionesService,
  ) {}

  create(createTarifaDto: CreateTarifaDto) {
    const frecuencia = this.frecuenciaRepository.findOne({
      where: {
        nombre: createTarifaDto.nombreFrecuencia.toUpperCase(),
        fechaBaja: IsNull(),
      },
    });

    const organizacion = this.organizacionesService.findOne(
      createTarifaDto.idOrganizacion,
    );

    return Promise.all([frecuencia, organizacion]).then((results) => {
      return this.tarifaRepository.save({
        nombre: createTarifaDto.nombre,
        monto: createTarifaDto.monto,
        frecuencia: results[0],
        organizacion: results[1],
      });
    });
  }

  createFrecuencia(createFrecuenciaDto: CreateFrecuenciaDto) {
    const frecuencia = {
      nombre: createFrecuenciaDto.nombre.toUpperCase(),
      cantDias: createFrecuenciaDto.cantDias,
    };
    return this.frecuenciaRepository.save(frecuencia);
  }

  findAllFrecuencias() {
    return this.frecuenciaRepository.find({
      where: { fechaBaja: IsNull() },
    });
  }

  findAll() {
    return this.tarifaRepository.find({
      where: { fechaBaja: IsNull() },
      relations: {
        organizacion: true,
        frecuencia: true,
      },
    });
  }

  findOne(id: string) {
    return this.tarifaRepository.findOne({
      where: { id: id, fechaBaja: IsNull() },
      relations: {
        organizacion: true,
        frecuencia: true,
      },
    });
  }

  asignarTarifas(tarifas: Tarifa[], turno: ActividadOrganizacion) {
    return tarifas.map((tarifa) => {
      return this.tarifaActividadRepository.save({
        actividadOrganizacion: turno,
        tarifa: tarifa,
      });
    });
  }

  async update(id: string, updateTarifaDto: UpdateTarifaDto) {
    const tarifa = await this.tarifaRepository.findOne({
      where: { id: id, fechaBaja: IsNull() },
    });

    for (const property in tarifa) {
      if (tarifa[property] && !['fechaBaja', 'id'].includes(property)) {
        tarifa[property] = updateTarifaDto[property];
      }
    }

    return this.tarifaRepository.save(tarifa);
  }

  remove(id: string) {
    return this.tarifaRepository.softDelete(id);
  }
}
