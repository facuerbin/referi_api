import { Injectable } from '@nestjs/common';

@Injectable()
export class SeguridadService {
  create() {
    return 'This action adds a new tarifa';
  }

  findAll() {
    return `This action returns all tarifas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tarifa`;
  }

  update(id: number) {
    return `This action updates a #${id} tarifa`;
  }

  remove(id: number) {
    return `This action removes a #${id} tarifa`;
  }
}
