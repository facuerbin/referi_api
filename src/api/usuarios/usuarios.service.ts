import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Domicilio } from './entities/domicilio.entity';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Domicilio)
    private domicilioRepository: Repository<Domicilio>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const domicilio = await this.domicilioRepository.save({
      calle: createUsuarioDto.domicilio.calle,
      numero: createUsuarioDto.domicilio.numero,
      ciudad: createUsuarioDto.domicilio.ciudad,
      provincia: createUsuarioDto.domicilio.provincia,
    });
    return this.usuarioRepository.save({
      nombre: createUsuarioDto.nombre,
      apellido: createUsuarioDto.apellido,
      email: createUsuarioDto.email,
      password: createUsuarioDto.password,
      dni: createUsuarioDto.dni,
      telefono: createUsuarioDto.telefono,
      fechaNacimiento: createUsuarioDto.fechaNacimiento,
      fotoPerfil: createUsuarioDto.fotoPerfil,
      domicilio: domicilio,
    });
  }

  findAll() {
    return this.usuarioRepository.find({
      where: { isActive: true },
    });
  }

  findOne(id: string) {
    return this.usuarioRepository.findOne({
      relations: { domicilio: true },
      where: { id: id, isActive: true },
    });
  }

  findByEmail(email: string) {
    return this.usuarioRepository.findOne({
      where: { email: email, isActive: true },
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.usuarioRepository.findOne({
      where: { id: id, isActive: true },
    });

    for (const property in updateUsuarioDto) {
      if (user[property] && !['isActive', 'id'].includes(property)) {
        user[property] = updateUsuarioDto[property];
      }
    }

    return this.usuarioRepository.save(user);
  }

  remove(id: string) {
    return this.usuarioRepository.softDelete(id);
  }
}
