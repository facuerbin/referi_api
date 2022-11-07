import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ActividadesService } from '../actividades/actividades.service';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { CreateFrecuenciaDto } from './dto/create.frecuencia.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { Frecuencia } from './entities/frecuencia.entity';
import { Tarifa } from './entities/tarifa.entity';

@Injectable()
export class TarifasService {
  constructor(
    @InjectRepository(Tarifa) private tarifaRepository: Repository<Tarifa>,
    @InjectRepository(Frecuencia)
    private frecuenciaRepository: Repository<Frecuencia>,
    private organizacionesService: OrganizacionesService,
    @Inject(forwardRef(() => ActividadesService))
    private actividadService: ActividadesService,
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

    const actividad = this.actividadService.detailActividad(
      createTarifaDto.idActividad,
    );

    return Promise.all([frecuencia, organizacion, actividad]).then(
      (results) => {
        // if (!results[0] || !results[1] || !results[2]) throw new Error();
        return this.tarifaRepository.save({
          nombre: createTarifaDto.nombre,
          monto: createTarifaDto.monto,
          esOpcional: createTarifaDto.esOpcional,
          frecuencia: results[0],
          organizacion: results[1],
          actividad: results[2],
        });
      },
    );
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

  findByOrg(idOrg: string) {
    return this.tarifaRepository.find({
      where: {
        organizacion: {
          id: idOrg,
        },
        fechaBaja: IsNull(),
      },
      relations: {
        organizacion: true,
        frecuencia: true,
        actividad: true,
      },
    });
  }

  findByActividad(idActividad: string) {
    return this.tarifaRepository.find({
      where: {
        actividad: {
          id: idActividad,
        },
        fechaBaja: IsNull(),
      },
      relations: {
        organizacion: true,
        frecuencia: true,
        actividad: true,
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

  async update(id: string, updateTarifaDto: UpdateTarifaDto) {
    const tarifa = await this.tarifaRepository.findOne({
      where: { id: id, fechaBaja: IsNull() },
    });

    for (const property in updateTarifaDto) {
      if (
        !['fechaBaja', 'id'].includes(property) &&
        updateTarifaDto[property]
      ) {
        tarifa[property] = updateTarifaDto[property];
      }
    }

    return this.tarifaRepository.save(tarifa);
  }

  remove(id: string) {
    return this.tarifaRepository.softDelete(id);
  }
}
