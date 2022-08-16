import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(private dataSource: DataSource) {}

  create(createUsuarioDto: CreateUsuarioDto) {
    const userRepository = this.dataSource.getRepository(Usuario);
    return userRepository.save(createUsuarioDto);
  }

  findAll() {
    const userRepository = this.dataSource.getRepository(Usuario);
    return userRepository.find({
      relations: { domicilios: true },
      where: { isActive: true },
    });
  }

  findOne(id: string) {
    const userRepository = this.dataSource.getRepository(Usuario);
    return userRepository.findOne({
      relations: { domicilios: true },
      where: { id: id, isActive: true },
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const userRepository = this.dataSource.getRepository(Usuario);
    const user = await userRepository.findOne({
      where: { id: id, isActive: true },
    });

    for (const property in updateUsuarioDto) {
      if (user[property] && property !== 'isActive') {
        user[property] = updateUsuarioDto[property];
      }
    }

    return userRepository.save(user);
  }

  remove(id: string) {
    const userRepository = this.dataSource.getRepository(Usuario);
    return userRepository.softDelete(id);
  }
}
