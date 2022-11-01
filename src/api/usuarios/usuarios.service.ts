import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync, unlink } from 'fs';
import { join } from 'path';
import { IsNull, Repository } from 'typeorm';
import { RegisterDto } from '../seguridad/dto/register.dto';
import { UpdateUsuarioDto } from './dto/update.usuario.dto';
import { Domicilio } from './entities/domicilio.entity';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Domicilio)
    private domicilioRepository: Repository<Domicilio>,
  ) {}

  async create(userObject: RegisterDto) {
    const domicilio = await this.domicilioRepository.save({
      calle: userObject.domicilio.calle,
      numero: userObject.domicilio.numero,
      ciudad: userObject.domicilio.ciudad,
      provincia: userObject.domicilio.provincia,
    });
    return this.usuarioRepository.save({
      nombre: userObject.nombre,
      apellido: userObject.apellido,
      email: userObject.email,
      password: userObject.password,
      dni: userObject.dni,
      telefono: userObject.telefono,
      fechaNacimiento: userObject.fechaNacimiento,
      fotoPerfil: userObject.fotoPerfil,
      domicilio: domicilio,
    });
  }

  findAll() {
    return this.usuarioRepository.find({
      where: { fechaBaja: IsNull() },
    });
  }

  findOne(id: string) {
    return this.usuarioRepository.findOne({
      relations: { domicilio: true },
      where: { id: id, fechaBaja: IsNull() },
    });
  }

  findByEmail(email: string) {
    return this.usuarioRepository.findOne({
      where: { email: email, fechaBaja: IsNull() },
      relations: { domicilio: true },
    });
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    const user = await this.usuarioRepository.findOne({
      where: { id: id, fechaBaja: IsNull() },
    });

    for (const property in updateUsuarioDto) {
      if (property == 'fotoPerfil') {
        try {
          const filePath = join(process.cwd(), user.fotoPerfil);
          if (existsSync(filePath)) {
            unlink(filePath, (err) => {
              return err;
            });
          }
        } catch (error) {
          return error;
        }
      }

      if (
        user[property] &&
        !['fechaBaja', 'id', 'verificado', 'password'].includes(property)
      ) {
        user[property] = updateUsuarioDto[property];
      }
    }

    return this.usuarioRepository.save(user);
  }

  save(user: Usuario) {
    return this.usuarioRepository.save(user);
  }

  remove(id: string) {
    return this.usuarioRepository.softDelete(id);
  }

  async verifyEmail(userId: string) {
    const user = await this.findOne(userId);
    user.verificado = true;
    return this.usuarioRepository.save(user);
  }
}
