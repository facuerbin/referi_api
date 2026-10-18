import { Module } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { Asistente } from './entities/asistente.entity';
import { PlanillaAsistencia } from './entities/planilla.asistencia.entity';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
import { PersonalOrganizacion } from '../organizaciones/entities/personal.organizacion.entity';
import { OrgStaffGuard } from '../seguridad/jwt/org.staff.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  controllers: [AsistenciasController],
  providers: [AsistenciasService, OrgStaffGuard],
  imports: [
    TypeOrmModule.forFeature([
      Asistente,
      PlanillaAsistencia,
      Inscripcion,
      PersonalOrganizacion,
    ]),
    OrganizacionesModule,
    UsuariosModule,
  ],
})
export class AsistenciasModule {}
