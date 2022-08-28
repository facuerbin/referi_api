import { Module } from '@nestjs/common';
import { OrganizacionesService } from './organizaciones.service';
import { OrganizacionesController } from './organizaciones.controller';
import { Domicilio } from '../usuarios/entities/domicilio.entity';
import { Organizacion } from './entities/organizacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoOrganizacion } from './entities/tipo.organizacion.entity';
import { Espacio } from './entities/espacio.entity';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PersonalOrganizacion } from './entities/personal.organizacion.entity';
import { Rol } from './entities/rol.entity';

@Module({
  controllers: [OrganizacionesController],
  providers: [OrganizacionesService],
  imports: [
    TypeOrmModule.forFeature([Organizacion, Domicilio, TipoOrganizacion, Espacio, PersonalOrganizacion, Rol]),
    UsuariosModule
  ],
})
export class OrganizacionesModule {}
