import { Injectable } from '@nestjs/common';
import { CreateOrganizacionDto } from './dto/create-organizacione.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacione.dto';

@Injectable()
export class OrganizacionesService {
  create(createOrganizacioneDto: CreateOrganizacionDto) {
    return 'This action adds a new organizacione';
  }

  findAll() {
    return `This action returns all organizaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organizacione`;
  }

  update(id: number, updateOrganizacioneDto: UpdateOrganizacionDto) {
    return `This action updates a #${id} organizacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} organizacione`;
  }
}
