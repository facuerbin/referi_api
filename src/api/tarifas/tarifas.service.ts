import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async create(createTarifaDto: CreateTarifaDto) {
    const frecuencia = await this.frecuenciaRepository.findOne({
      where: { nombre: createTarifaDto.frecuencia.toUpperCase() },
    });
    const tarifa = new Tarifa();
    tarifa.nombre = createTarifaDto.nombre;
    tarifa.monto = createTarifaDto.monto;
    tarifa.frecuencia = frecuencia;

    return this.tarifaRepository.save(tarifa);
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
      where: { isActive: true },
    });
  }

  findAll() {
    return this.tarifaRepository.find({
      where: { isActive: true },
    });
  }

  findOne(id: string) {
    return this.tarifaRepository.findOne({
      where: { id: id, isActive: true },
    });
  }

  async update(id: string, updateTarifaDto: UpdateTarifaDto) {
    const tarifa = await this.tarifaRepository.findOne({
      where: { id: id, isActive: true },
    });

    for (const property in tarifa) {
      if (tarifa[property] && !['isActive', 'id'].includes(property)) {
        tarifa[property] = updateTarifaDto[property];
      }
    }

    return this.tarifaRepository.save(tarifa);
  }

  remove(id: string) {
    return this.tarifaRepository.softDelete(id);
  }
}
