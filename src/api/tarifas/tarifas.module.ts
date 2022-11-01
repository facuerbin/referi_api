import { forwardRef, Module } from '@nestjs/common';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';
import { Tarifa } from './entities/tarifa.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Frecuencia } from './entities/frecuencia.entity';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';
import { ActividadesModule } from '../actividades/actividades.module';

@Module({
  controllers: [TarifasController],
  providers: [TarifasService],
  imports: [
    TypeOrmModule.forFeature([Tarifa, Frecuencia]),
    OrganizacionesModule,
    forwardRef(() => ActividadesModule),
  ],
  exports: [TarifasService],
})
export class TarifasModule {}
