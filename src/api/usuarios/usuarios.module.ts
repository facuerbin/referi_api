import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domicilio } from './entities/domicilio.entity';
import { PersonalOrganizacion } from '../organizaciones/entities/personal.organizacion.entity';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
import { StaffOrSelfGuard } from '../seguridad/jwt/staff.or.self.guard';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService, StaffOrSelfGuard],
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Domicilio,
      PersonalOrganizacion,
      Inscripcion,
    ]),
  ],
  exports: [UsuariosService],
})
export class UsuariosModule {}
