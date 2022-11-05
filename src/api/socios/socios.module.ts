import { Module } from '@nestjs/common';
import { SociosService } from './socios.service';
import { SociosController } from './socios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inscripcion } from './entities/inscripcion.entity';
import { EstadoInscripcion } from './entities/estado.inscripcion.entity';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';
import { ActividadesModule } from '../actividades/actividades.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PagosModule } from '../pagos/pagos.module';

@Module({
  controllers: [SociosController],
  providers: [SociosService],
  imports: [
    TypeOrmModule.forFeature([Inscripcion, EstadoInscripcion]),
    OrganizacionesModule,
    ActividadesModule,
    UsuariosModule,
    PagosModule,
  ],
  exports: [SociosService],
})
export class SociosModule {}
