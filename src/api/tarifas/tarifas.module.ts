import { Module } from '@nestjs/common';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';
import { Tarifa } from './entities/tarifa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Frecuencia } from './entities/frecuencia.entity';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';
import { TarifaActividad } from './entities/tarifa.actividad.entity';

@Module({
  controllers: [TarifasController],
  providers: [TarifasService],
  imports: [
    TypeOrmModule.forFeature([Tarifa, Frecuencia, TarifaActividad]),
    OrganizacionesModule,
  ],
  exports: [TarifasService],
})
export class TarifasModule {}
