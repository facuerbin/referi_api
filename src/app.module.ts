import { CacheModule, Module } from '@nestjs/common';
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
import { Usuario } from './api/usuarios/entities/usuario.entity';
import { Domicilio } from './api/usuarios/entities/domicilio.entity';
import { Pago } from './api/pagos/entities/pago.entity';
import { Actividad } from './api/actividades/entities/actividad.entity';
import { TurnoActividad } from './api/actividades/entities/turno.actividad.entity';
import { Horario } from './api/actividades/entities/horario.entity';
import { Asistente } from './api/asistencias/entities/asistente.entity';
import { PlanillaAsistencia } from './api/asistencias/entities/planilla.asistencia.entity';
import { Espacio } from './api/organizaciones/entities/espacio.entity';
import { InformacionPago } from './api/organizaciones/entities/informacion.pago.entity';
import { Organizacion } from './api/organizaciones/entities/organizacion.entity';
import { Permiso } from './api/organizaciones/entities/permiso.entity';
import { PersonalOrganizacion } from './api/organizaciones/entities/personal.organizacion.entity';
import { Rol } from './api/organizaciones/entities/rol.entity';
import { TipoOrganizacion } from './api/organizaciones/entities/tipo.organizacion.entity';
import { Cuota } from './api/pagos/entities/cuota.entity';
import { EstadoInscripcion } from './api/socios/entities/estado.inscripcion.entity';
import { Inscripcion } from './api/socios/entities/inscripcion.entity';
import { Frecuencia } from './api/tarifas/entities/frecuencia.entity';
import { Tarifa } from './api/tarifas/entities/tarifa.entity';
import { Notificacion } from './api/notificaciones/entities/notificacion.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TipoActividad } from './api/actividades/entities/tipo.actividad.entity';
import { EstadoActividad } from './api/actividades/entities/estado.actividad.entity';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { ImagesModule } from './api/images/images.module';
import { TurnoHorario } from './api/actividades/entities/turno.horario.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificacionUsuario } from './api/notificaciones/entities/notificaciones.usuario.entity';
import { AdminModule } from './api/admin/admin.module';
import { Backup } from './api/admin/entities/backup.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { Admin } from './api/admin/entities/admin.entity';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'web'),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      namingStrategy: new SnakeNamingStrategy(),
      host: config.DB_HOST,
      port: config.DB_PORT,
      username: config.DB_USER_NAME,
      password: config.DB_USER_PASSWORD,
      database: config.DB_NAME,
      entities: [
        Actividad,
        TurnoActividad,
        EstadoActividad,
        TipoActividad,
        Horario,
        TurnoHorario,
        Asistente,
        PlanillaAsistencia,
        Espacio,
        InformacionPago,
        Organizacion,
        Permiso,
        PersonalOrganizacion,
        Rol,
        TipoOrganizacion,
        Cuota,
        Pago,
        EstadoInscripcion,
        Inscripcion,
        Frecuencia,
        Tarifa,
        Domicilio,
        Usuario,
        Notificacion,
        NotificacionUsuario,
        Backup,
        Admin,
      ],
      synchronize: config.NODE_ENV === 'development' ? true : false,
      // logging: true,
    }),
    CacheModule.register({ isGlobal: true, ttl: 2000 }),
    SeguridadModule,
    EmailModule,
    OrganizacionesModule,
    SociosModule,
    UsuariosModule,
    ActividadesModule,
    TarifasModule,
    PagosModule,
    NotificacionesModule,
    AsistenciasModule,
    ImagesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
