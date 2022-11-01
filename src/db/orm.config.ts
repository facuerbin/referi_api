import { Actividad } from './../api/actividades/entities/actividad.entity';
import { TurnoActividad } from '../api/actividades/entities/turno.actividad.entity';
import { EstadoActividad } from './../api/actividades/entities/estado.actividad.entity';
import { Horario } from './../api/actividades/entities/horario.entity';
import { TipoActividad } from './../api/actividades/entities/tipo.actividad.entity';
import { Asistente } from './../api/asistencias/entities/asistente.entity';
import { PlanillaAsistencia } from './../api/asistencias/entities/planilla.asistencia.entity';
import { Notificacion } from './../api/notificaciones/entities/notificacion.entity';
import { Espacio } from './../api/organizaciones/entities/espacio.entity';
import { InformacionPago } from './../api/organizaciones/entities/informacion.pago.entity';
import { Organizacion } from './../api/organizaciones/entities/organizacion.entity';
import { Permiso } from './../api/organizaciones/entities/permiso.entity';
import { PersonalOrganizacion } from './../api/organizaciones/entities/personal.organizacion.entity';
import { Rol } from './../api/organizaciones/entities/rol.entity';
import { TipoOrganizacion } from './../api/organizaciones/entities/tipo.organizacion.entity';
import { Cuota } from './../api/pagos/entities/cuota.entity';
import { Pago } from './../api/pagos/entities/pago.entity';
import { EstadoInscripcion } from './../api/socios/entities/estado.inscripcion.entity';
import { Inscripcion } from './../api/socios/entities/inscripcion.entity';
import { InscripcionEstado } from './../api/socios/entities/inscripcion.estado.entity';
import { Frecuencia } from './../api/tarifas/entities/frecuencia.entity';
import { Tarifa } from './../api/tarifas/entities/tarifa.entity';
import { Domicilio } from './../api/usuarios/entities/domicilio.entity';
import { Usuario } from './../api/usuarios/entities/usuario.entity';
import { config } from './../config/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { DataSource } from 'typeorm';

const OrmConfig = new DataSource({
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
    InscripcionEstado,
    Frecuencia,
    Tarifa,
    Domicilio,
    Usuario,
    Notificacion,
  ],
  synchronize: config.NODE_ENV === 'development' ? true : false,
  migrations: ['dist/db/*.js'],
  migrationsRun: true,
});

OrmConfig.initialize();
