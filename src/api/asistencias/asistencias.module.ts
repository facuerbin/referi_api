import { Module } from '@nestjs/common';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { Asistente } from './entities/asistente.entity';
import { PlanillaAsistencia } from './entities/planilla.asistencia.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';

@Module({
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  imports: [
    TypeOrmModule.forFeature([Asistente, PlanillaAsistencia]),
    OrganizacionesModule,
  ],
})
export class AsistenciasModule {}
