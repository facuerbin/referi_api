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

  findAll() {
    return `This action returns all tarifas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tarifa`;
  }

  update(id: number, updateTarifaDto: UpdateTarifaDto) {
    return `This action updates a #${id} tarifa`;
  }

  remove(id: number) {
    return `This action removes a #${id} tarifa`;
  }
}
