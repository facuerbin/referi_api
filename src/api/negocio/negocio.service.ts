import { Injectable } from '@nestjs/common';
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';

@Injectable()
export class NegocioService {
  create(createNegocioDto: CreateNegocioDto) {
    return 'This action adds a new negocio';
  }

  findAll() {
    return `This action returns all negocio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} negocio`;
  }

  update(id: number, updateNegocioDto: UpdateNegocioDto) {
    return `This action updates a #${id} negocio`;
  }

  remove(id: number) {
    return `This action removes a #${id} negocio`;
  }
}
