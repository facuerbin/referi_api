import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Domicilio } from '../usuarios/entities/domicilio.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateOrganizacionDto } from './dto/create-organizacione.dto';
import { CreateEspacioDto } from './dto/create.espacio.dto';
import { CreatePersonalDto } from './dto/create.personal.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacione.dto';
import { Espacio } from './entities/espacio.entity';
import { Organizacion } from './entities/organizacion.entity';
import { PersonalOrganizacion } from './entities/personal.organizacion.entity';
import { Rol } from './entities/rol.entity';
import { TipoOrganizacion } from './entities/tipo.organizacion.entity';

@Injectable()
export class OrganizacionesService {
  constructor(
    @InjectRepository(Organizacion)
    private organizacionRepository: Repository<Organizacion>,
    @InjectRepository(Domicilio)
    private domicilioRepository: Repository<Domicilio>,
    @InjectRepository(TipoOrganizacion)
    private tipoOrganizacionRepository: Repository<TipoOrganizacion>,
    @InjectRepository(Espacio)
    private espacioRepository: Repository<Espacio>,
    @InjectRepository(PersonalOrganizacion)
    private personalRepository: Repository<PersonalOrganizacion>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    private usuariosService: UsuariosService,
  ) {}

  async create(createOrganizacionDto: CreateOrganizacionDto) {
    const direccion = await this.domicilioRepository.save({
      calle: createOrganizacionDto.direccion.calle,
      numero: createOrganizacionDto.direccion.numero,
      ciudad: createOrganizacionDto.direccion.ciudad,
      provincia: createOrganizacionDto.direccion.provincia,
    });
    const tipo = await this.tipoOrganizacionRepository.findOne({
      where: {
        nombre: createOrganizacionDto.tipoOrganizacion,
        fechaBaja: IsNull(),
      },
    });

    const organizacion = {
      nombre: createOrganizacionDto.nombre,
      direccion: direccion,
      logo: createOrganizacionDto.logo,
      descripcion: createOrganizacionDto.descripcion,
      telefono: createOrganizacionDto.telefono,
      email: createOrganizacionDto.email,
      tipo: tipo,
    };
    return this.organizacionRepository.save(organizacion);
  }

  findAll() {
    return this.organizacionRepository.find({
      relations: {
        direccion: true,
      },
      where: { fechaBaja: IsNull() },
    });
  }

  findOne(id: string) {
    return this.organizacionRepository.findOne({
      relations: { direccion: true, espacios: true },
      where: { id: id, fechaBaja: IsNull() },
    });
  }

  async update(id: string, updateOrganizacioneDto: UpdateOrganizacionDto) {
    const organizacion = await this.organizacionRepository.findOne({
      where: { id: id, fechaBaja: IsNull() },
    });

    for (const property in updateOrganizacioneDto) {
      if (organizacion[property] && !['fechaBaja', 'id'].includes(property)) {
        organizacion[property] = updateOrganizacioneDto[property];
      }
    }

    return this.organizacionRepository.save(organizacion);
  }

  remove(id: string) {
    return this.organizacionRepository.softDelete(id);
  }

  async createEspacio(orgId: string, createEspacioDto: CreateEspacioDto) {
    const organizacion = await this.findOne(orgId);

    return this.espacioRepository.save({
      nombre: createEspacioDto.nombre,
      capacidad: createEspacioDto.capacidad,
      organizacion: organizacion,
    });
  }

  findOneEspacio(id: string) {
    return this.espacioRepository.findOne({
      relations: { organizacion: true },
      where: { id: id, fechaBaja: IsNull() },
    });
  }

  async createPersonal(orgId: string, createPersonalDto: CreatePersonalDto) {
    const organizacion = this.findOne(orgId);
    const usuario = this.usuariosService.findByEmail(
      createPersonalDto.emailUsuario,
    );
    const rol = this.rolRepository.findOne({
      where: {
        nombre: createPersonalDto.rol.toUpperCase(),
        fechaBaja: IsNull(),
      },
    });

    Promise.all([organizacion, usuario, rol]).then((results) => {
      return this.personalRepository.save({
        personal: results[1],
        organizacion: results[0],
        rol: results[2],
      });
    });
  }

  listTipos() {
    return this.tipoOrganizacionRepository.find();
  }

  listEspacios() {
    return this.espacioRepository.find();
  }

  listEspaciosOrg(orgId: string) {
    return this.espacioRepository.find({
      relations: { organizacion: true },
      where: { organizacion: { id: orgId } },
    });
  }

  listEmployeeOrganization(employeeId: string) {
    return this.personalRepository.find({
      where: {
        personal: { id: employeeId },
        fechaBaja: IsNull(),
      },
      relations: {
        organizacion: true,
      },
    });
  }
}
