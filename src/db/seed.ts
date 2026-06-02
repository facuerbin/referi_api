import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from '../config/config';
import { Rol } from '../api/organizaciones/entities/rol.entity';
import { Permiso } from '../api/organizaciones/entities/permiso.entity';
import { TipoOrganizacion } from '../api/organizaciones/entities/tipo.organizacion.entity';
import { TipoActividad } from '../api/actividades/entities/tipo.actividad.entity';
import { EstadoActividad } from '../api/actividades/entities/estado.actividad.entity';
import { EstadoInscripcion, Estado } from '../api/socios/entities/estado.inscripcion.entity';
import { Frecuencia } from '../api/tarifas/entities/frecuencia.entity';

const dataSource = new DataSource({
  type: 'mysql',
  namingStrategy: new SnakeNamingStrategy(),
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USER_NAME,
  password: config.DB_USER_PASSWORD,
  database: config.DB_NAME,
  entities: ['src/api/**/entities/*.entity.ts'],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to database.');

  const rolRepo        = dataSource.getRepository(Rol);
  const permisoRepo    = dataSource.getRepository(Permiso);
  const tipoOrgRepo    = dataSource.getRepository(TipoOrganizacion);
  const tipoActRepo    = dataSource.getRepository(TipoActividad);
  const estadoActRepo  = dataSource.getRepository(EstadoActividad);
  const estadoInsRepo  = dataSource.getRepository(EstadoInscripcion);
  const frecuenciaRepo = dataSource.getRepository(Frecuencia);

  await tipoOrgRepo.upsert([
    { id: '1807b271-5872-4356-9ac9-551266e6973f', nombre: 'Club' },
    { id: '7faac0ab-5398-42e4-aab9-54b7a0ce9289', nombre: 'Gimnasio' },
    { id: 'fcc63257-3837-45b5-990e-b80e579fdb8e', nombre: 'Instituto de Danza' },
    { id: 'a6896feb-2490-4a92-aebc-7932bdd24081', nombre: 'Otros' },
  ], ['id']);
  console.log('✔ tipo_organizacion');

  await tipoActRepo.upsert([
    { id: '0ee6d17b-6db7-4d6f-a8a8-bd16f66b66c4', tipo: 'BASKETBALL',     imgUrl: 'uploads/basket.png' },
    { id: '27531bc9-1d26-4625-a9c4-e43250cdc66f', tipo: 'FUTBOL',          imgUrl: 'uploads/futbol.png' },
    { id: 'afcb2189-6436-4033-9dbc-8818745cbbc0', tipo: 'GIMNASIO',        imgUrl: 'uploads/gimnasio.png' },
    { id: '2d10c95e-5caf-44bb-99e7-487ece807960', tipo: 'VOLLEY',          imgUrl: 'uploads/voley.png' },
    { id: '61a0ec24-8d51-4fc5-916c-f88b247f3991', tipo: 'DANZA',           imgUrl: 'uploads/danza.png' },
    { id: 'a903e1aa-3220-40e6-8953-0de41a230238', tipo: 'RUGBY',           imgUrl: 'uploads/rugby.png' },
    { id: '1348d362-57de-4694-b0f6-d699a13382d4', tipo: 'ARTES MARCIALES', imgUrl: 'uploads/artes_marciales.png' },
    { id: '57d71ff3-a45d-4d85-ad82-126fc0e64c02', tipo: 'HANDBALL',        imgUrl: 'uploads/handball.png' },
    { id: '5cc007aa-1a29-4736-85c3-4f04d33245ad', tipo: 'NATACIÓN',        imgUrl: 'uploads/natacion.png' },
    { id: '506049d4-2f12-4db5-bab4-b28b63e24056', tipo: 'TENIS',           imgUrl: 'uploads/tenis.png' },
    { id: '58b7b4dd-5dec-406c-b5ae-a3b803544a93', tipo: 'OTROS',           imgUrl: 'uploads/otros.png' },
  ], ['id']);
  console.log('✔ tipo_actividad');

  await estadoActRepo.upsert([
    { id: '3c2020d5-e2c4-46e4-a6b7-83dd016e86c3', estado: 'ACTIVO' },
    { id: '4928b199-24e4-41ce-898c-dd091101e77e', estado: 'SIN CUPO' },
    { id: 'aa76997a-ed87-4701-87d4-6c8a8218d4d3', estado: 'FINALIZADA' },
  ], ['id']);
  console.log('✔ estado_actividad');

  await estadoInsRepo.upsert([
    { id: 'eab033cb-4d15-4c2d-afb6-ba78a379759c', nombre: Estado.ACTIVO },
    { id: 'ca27b709-c22b-49a9-bae8-e3cde34194f4', nombre: Estado.DEUDOR },
    { id: 'e52ae73f-2811-4e98-a69a-3f03cd27c2b2', nombre: Estado.INACTIVO },
    { id: 'f89cf450-69fe-4b33-8cc0-1b39142f6cf3', nombre: Estado.BAJA },
  ], ['id']);
  console.log('✔ estado_inscripcion');

  await frecuenciaRepo.upsert([
    { id: '70a51775-070d-49fd-93db-3b95386b5c35', nombre: 'MENSUAL',   cantDias: 30 },
    { id: '3815c2b1-286c-4d10-a891-0cead6270a44', nombre: 'ANUAL',     cantDias: 365 },
    { id: '80668c54-d18d-42b5-a90e-d5bbba7f9347', nombre: 'SEMANAL',   cantDias: 7 },
    { id: '89086fa7-8b32-4304-a181-0a362a111be4', nombre: 'MATRICULA', cantDias: 0 },
  ], ['id']);
  console.log('✔ frecuencia');

  const permisos = await permisoRepo.upsert([
    { id: 'daef770d-0409-4361-b8e3-1cbc749fcb32', modulo: 'SOCIOS' },
    { id: '44e34682-6f87-4e56-895c-26ba55a9f2bd', modulo: 'ACTIVIDADES' },
    { id: 'a6c56e9b-a8a1-4eaa-a69b-c8ff9734fc99', modulo: 'REPORTES' },
    { id: 'ddb15163-9aa1-45e6-a032-bd29cad07374', modulo: 'ASISTENCIA' },
    { id: 'e817e7ee-f449-4c45-8be9-09ed6b749565', modulo: 'TARIFAS' },
    { id: 'e9c6110b-d2a9-4ef9-b9b8-0bad1d6d38f9', modulo: 'NOTIFICACIONES' },
    { id: 'd8b8e481-ec3e-45a9-a7ae-4fd3ee5cc1cd', modulo: 'PAGOS' },
    { id: '42b4f87d-dfcd-4094-9a00-845b3d8db15a', modulo: 'ORGANIZACION' },
  ], ['id']);
  console.log('✔ permiso');

  const all        = await permisoRepo.find();
  const socios     = all.find(p => p.modulo === 'SOCIOS')!;
  const actividades= all.find(p => p.modulo === 'ACTIVIDADES')!;
  const reportes   = all.find(p => p.modulo === 'REPORTES')!;
  const asistencia = all.find(p => p.modulo === 'ASISTENCIA')!;
  const tarifas    = all.find(p => p.modulo === 'TARIFAS')!;
  const notif      = all.find(p => p.modulo === 'NOTIFICACIONES')!;
  const pagos      = all.find(p => p.modulo === 'PAGOS')!;
  const org        = all.find(p => p.modulo === 'ORGANIZACION')!;

  // upsert the rol rows first (no relations)
  await rolRepo.upsert([
    { id: '82e1a2fd-eb51-408d-86fe-44a180853f0e', nombre: 'ADMINISTRADOR', descripcion: 'Es el dueño de la organización, tiene control total sobre la misma.' },
    { id: 'de62dd9d-fdb4-44ce-ac41-cbfdd7f348ad', nombre: 'PORTERO',       descripcion: 'Se encarga de registrar el ingreso a la organización y puede registrar nuevos socios.' },
    { id: '4adacacf-f41c-431e-b2df-429f9fc1d4b6', nombre: 'ADMINISTRATIVO',descripcion: 'Puede manejar todos los aspectos del negocio a excepción de los datos sensibles de la institución.' },
    { id: 'ec430664-fabf-481f-be1d-af53e187abc5', nombre: 'CONTABLE',      descripcion: 'Puede manejar lo referido a tarifas y pagos de la institución.' },
  ], ['id']);
  console.log('✔ rol');

  // save with permisos so TypeORM populates the permiso_rol junction table
  const roles = await rolRepo.find({ relations: ['permisos'] });
  const byId = (id: string) => roles.find(r => r.id === id)!;

  await rolRepo.save([
    { ...byId('82e1a2fd-eb51-408d-86fe-44a180853f0e'), permisos: [socios, actividades, reportes, asistencia, tarifas, notif, pagos, org] },
    { ...byId('de62dd9d-fdb4-44ce-ac41-cbfdd7f348ad'), permisos: [socios, asistencia] },
    { ...byId('4adacacf-f41c-431e-b2df-429f9fc1d4b6'), permisos: [socios, actividades, reportes, asistencia, tarifas, notif, pagos] },
    { ...byId('ec430664-fabf-481f-be1d-af53e187abc5'), permisos: [tarifas, pagos] },
  ]);
  console.log('✔ permiso_rol');

  console.log('\nSeed complete.');
  await dataSource.destroy();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
