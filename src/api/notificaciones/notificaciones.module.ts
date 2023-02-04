import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { SociosModule } from '../socios/socios.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { OrganizacionesModule } from '../organizaciones/organizaciones.module';
import { NotificacionUsuario } from './entities/notificaciones.usuario.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  imports: [
    TypeOrmModule.forFeature([Notificacion, NotificacionUsuario, Usuario]),
    SociosModule,
    OrganizacionesModule,
  ],
})
export class NotificacionesModule {}
