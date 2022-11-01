import { forwardRef, Module } from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { ActividadesController } from './actividades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurnoActividad } from './entities/turno.actividad.entity';
import { Actividad } from './entities/actividad.entity';
import { EstadoActividad } from './entities/estado.actividad.entity';
import { Horario } from './entities/horario.entity';
import { TipoActividad } from './entities/tipo.actividad.entity';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';
import { TarifasModule } from '../tarifas/tarifas.module';
import { TurnoHorario } from './entities/turno.horario.entity';

@Module({
  controllers: [ActividadesController],
  providers: [ActividadesService],
  imports: [
    TypeOrmModule.forFeature([
      TurnoActividad,
      Actividad,
      EstadoActividad,
      Horario,
      TurnoHorario,
      TipoActividad,
    ]),
    OrganizacionesModule,
    forwardRef(() => TarifasModule),
  ],
  exports: [ActividadesService],
})
export class ActividadesModule {}
