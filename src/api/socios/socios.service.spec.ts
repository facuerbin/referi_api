import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SociosService } from './socios.service';
import { Inscripcion } from './entities/inscripcion.entity';
import { EstadoInscripcion, Estado } from './entities/estado.inscripcion.entity';
import { ActividadesService } from '../actividades/actividades.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PagosService } from '../pagos/pagos.service';

describe('SociosService', () => {
  let service: SociosService;
  let inscripcionRepo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };
  let estadoRepo: { find: jest.Mock; findOne: jest.Mock; findOneBy: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SociosService,
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: { find: jest.fn(), findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(EstadoInscripcion),
          useValue: { find: jest.fn(), findOne: jest.fn(), findOneBy: jest.fn() },
        },
        {
          provide: ActividadesService,
          useValue: { detailTurno: jest.fn() },
        },
        {
          provide: UsuariosService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: PagosService,
          useValue: { createCuotas: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SociosService>(SociosService);
    inscripcionRepo = module.get(getRepositoryToken(Inscripcion));
    estadoRepo = module.get(getRepositoryToken(EstadoInscripcion));
  });

  afterEach(() => jest.clearAllMocks());

  describe('inscriptosPorMes', () => {
    it('counts inscriptions grouped by year-month', async () => {
      inscripcionRepo.find.mockResolvedValue([
        { fechaCreacion: new Date('2024-01-15') },
        { fechaCreacion: new Date('2024-01-20') },
        { fechaCreacion: new Date('2024-02-10') },
      ]);

      const result = await service.inscriptosPorMes({
        idOrganizacion: 'org-1',
        fromYear: 2024, fromMonth: 1,
        toYear: 2024, toMonth: 2,
      });

      expect(result['2024-01']).toBe(2);
      expect(result['2024-02']).toBe(1);
    });

    it('returns an empty object when there are no inscriptions', async () => {
      inscripcionRepo.find.mockResolvedValue([]);

      const result = await service.inscriptosPorMes({
        idOrganizacion: 'org-1',
        fromYear: 2024, fromMonth: 1,
        toYear: 2024, toMonth: 3,
      });

      expect(result).toEqual({});
    });

    it('counts correctly when all inscriptions fall in the same month', async () => {
      inscripcionRepo.find.mockResolvedValue([
        { fechaCreacion: new Date('2024-03-01') },
        { fechaCreacion: new Date('2024-03-15') },
        { fechaCreacion: new Date('2024-03-28') },
      ]);

      const result = await service.inscriptosPorMes({
        idOrganizacion: 'org-1',
        fromYear: 2024, fromMonth: 3,
        toYear: 2024, toMonth: 3,
      });

      expect(result['2024-03']).toBe(3);
      expect(Object.keys(result)).toHaveLength(1);
    });
  });

  describe('sociosPorEstadoOrganizacion', () => {
    it('counts socios grouped by estado name', async () => {
      inscripcionRepo.find.mockResolvedValue([
        { estados: [{ nombre: Estado.ACTIVO }] },
        { estados: [{ nombre: Estado.ACTIVO }] },
        { estados: [{ nombre: Estado.DEUDOR }] },
        { estados: [{ nombre: Estado.INACTIVO }] },
      ]);

      const result = await service.sociosPorEstadoOrganizacion('org-1');

      expect(result[Estado.ACTIVO]).toBe(2);
      expect(result[Estado.DEUDOR]).toBe(1);
      expect(result[Estado.INACTIVO]).toBe(1);
    });

    it('returns an empty object when there are no socios', async () => {
      inscripcionRepo.find.mockResolvedValue([]);
      expect(await service.sociosPorEstadoOrganizacion('org-1')).toEqual({});
    });
  });

  describe('sociosDeudoresPorActividad', () => {
    it('counts deudores grouped by actividad name', async () => {
      inscripcionRepo.find.mockResolvedValue([
        { turnoActividad: { actividad: { nombre: 'Futbol' } } },
        { turnoActividad: { actividad: { nombre: 'Futbol' } } },
        { turnoActividad: { actividad: { nombre: 'Natacion' } } },
      ]);

      const result = await service.sociosDeudoresPorActividad('org-1');

      expect(result['Futbol']).toBe(2);
      expect(result['Natacion']).toBe(1);
    });

    it('returns an empty object when there are no deudores', async () => {
      inscripcionRepo.find.mockResolvedValue([]);
      expect(await service.sociosDeudoresPorActividad('org-1')).toEqual({});
    });
  });

  describe('rangoEtarioSociosOrganizacion', () => {
    it('groups socios into 5-year age buckets', async () => {
      const makeBirthDate = (yearsAgo: number) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - yearsAgo);
        return d;
      };

      inscripcionRepo.find.mockResolvedValue([
        { usuario: { fechaNacimiento: makeBirthDate(25) } },
        { usuario: { fechaNacimiento: makeBirthDate(27) } },
        { usuario: { fechaNacimiento: makeBirthDate(35) } },
      ]);

      const result = await service.rangoEtarioSociosOrganizacion('org-1');

      expect(result[25]).toBe(2);
      expect(result[35]).toBe(1);
    });
  });

  describe('inscriptosPorActividadPorMes', () => {
    it('counts inscriptions for a specific activity grouped by year-month', async () => {
      inscripcionRepo.find.mockResolvedValue([
        { fechaCreacion: new Date('2024-05-10') },
        { fechaCreacion: new Date('2024-05-20') },
        { fechaCreacion: new Date('2024-06-05') },
      ]);

      const result = await service.inscriptosPorActividadPorMes({
        idActividad: 'act-1',
        fromYear: 2024, fromMonth: 5,
        toYear: 2024, toMonth: 6,
      });

      expect(result['2024-05']).toBe(2);
      expect(result['2024-06']).toBe(1);
    });
  });
});
