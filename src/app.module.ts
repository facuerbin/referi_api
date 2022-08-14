import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeguridadModule } from './api/seguridad/seguridad.module';
import { OrganizacionesModule } from './api/organizaciones/organizaciones.module';
import { SociosModule } from './api/socios/socios.module';
import { UsuariosModule } from './api/usuarios/usuarios.module';
import { ActividadesModule } from './api/actividades/actividades.module';
import { TarifasModule } from './api/tarifas/tarifas.module';
import { PagosModule } from './api/pagos/pagos.module';
import { NotificacionesModule } from './api/notificaciones/notificaciones.module';
import { AsistenciasModule } from './api/asistencias/asistencias.module';
import { config } from './config/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: config.DB_HOST,
      port: config.DB_PORT,
      username: config.DB_USER_NAME,
      password: config.DB_USER_PASSWORD,
      database: config.DB_NAME,
      entities: [],
      synchronize: true,
    }),
    SeguridadModule,
    OrganizacionesModule,
    SociosModule,
    UsuariosModule,
    ActividadesModule,
    TarifasModule,
    PagosModule,
    NotificacionesModule,
    AsistenciasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
