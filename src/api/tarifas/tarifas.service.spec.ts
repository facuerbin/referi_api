import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TarifasService } from './tarifas.service';
import { Tarifa } from './entities/tarifa.entity';
import { Frecuencia } from './entities/frecuencia.entity';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { ActividadesService } from '../actividades/actividades.service';

describe('TarifasService', () => {
  let service: TarifasService;
  let tarifaRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock; softDelete: jest.Mock };
  let frecuenciaRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock };
  let orgService: jest.Mocked<OrganizacionesService>;
  let actividadService: jest.Mocked<ActividadesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarifasService,
        {
          provide: getRepositoryToken(Tarifa),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), softDelete: jest.fn() },
        },
        {
          provide: getRepositoryToken(Frecuencia),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() },
        },
        {
          provide: OrganizacionesService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: ActividadesService,
          useValue: { detailActividad: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TarifasService>(TarifasService);
    tarifaRepo = module.get(getRepositoryToken(Tarifa));
    frecuenciaRepo = module.get(getRepositoryToken(Frecuencia));
    orgService = module.get(OrganizacionesService);
    actividadService = module.get(ActividadesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('resolves frecuencia, organizacion and actividad then saves the tarifa', async () => {
      const mockFrecuencia = { id: 'frec-1' };
      const mockOrg = { id: 'org-1' };
      const mockActividad = { id: 'act-1' };
      frecuenciaRepo.findOne.mockResolvedValue(mockFrecuencia);
      orgService.findOne.mockResolvedValue(mockOrg as any);
      actividadService.detailActividad.mockResolvedValue(mockActividad as any);
      tarifaRepo.save.mockResolvedValue({ id: 'tarifa-1' });

      const dto = {
        nombre: 'Cuota mensual', monto: 5000, esOpcional: false,
        nombreFrecuencia: 'mensual', idOrganizacion: 'org-1', idActividad: 'act-1',
      } as any;

      await service.create(dto);

      expect(tarifaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Cuota mensual', monto: 5000,
          frecuencia: mockFrecuencia, organizacion: mockOrg, actividad: mockActividad,
        }),
      );
    });

    it('queries frecuencia with the uppercased nombre', async () => {
      frecuenciaRepo.findOne.mockResolvedValue({ id: 'frec-1' });
      orgService.findOne.mockResolvedValue({} as any);
      actividadService.detailActividad.mockResolvedValue({} as any);
      tarifaRepo.save.mockResolvedValue({});

      await service.create({ nombreFrecuencia: 'mensual', idOrganizacion: '', idActividad: '' } as any);

      expect(frecuenciaRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ nombre: 'MENSUAL' }) }),
      );
    });
  });

  describe('createFrecuencia', () => {
    it('uppercases the nombre before saving', async () => {
      frecuenciaRepo.save.mockResolvedValue({ id: 'frec-1' });

      await service.createFrecuencia({ nombre: 'quincenal', cantDias: 15 });

      expect(frecuenciaRepo.save).toHaveBeenCalledWith({ nombre: 'QUINCENAL', cantDias: 15 });
    });
  });

  describe('update', () => {
    it('updates allowed fields on the tarifa', async () => {
      const mockTarifa = { id: 'tarifa-1', nombre: 'Viejo', monto: 1000 };
      tarifaRepo.findOne.mockResolvedValue({ ...mockTarifa });
      tarifaRepo.save.mockResolvedValue({});

      await service.update('tarifa-1', { nombre: 'Nuevo', monto: 2000 } as any);

      const saved = tarifaRepo.save.mock.calls[0][0];
      expect(saved.nombre).toBe('Nuevo');
      expect(saved.monto).toBe(2000);
    });

    it('does not overwrite id or fechaBaja', async () => {
      tarifaRepo.findOne.mockResolvedValue({ id: 'tarifa-1', fechaBaja: null });
      tarifaRepo.save.mockResolvedValue({});

      await service.update('tarifa-1', { id: 'hacked', fechaBaja: new Date(), nombre: 'X' } as any);

      const saved = tarifaRepo.save.mock.calls[0][0];
      expect(saved.id).toBe('tarifa-1');
      expect(saved.fechaBaja).toBeNull();
    });

    it('ignores falsy values in the update dto', async () => {
      tarifaRepo.findOne.mockResolvedValue({ id: 'tarifa-1', nombre: 'Original', monto: 500 });
      tarifaRepo.save.mockResolvedValue({});

      await service.update('tarifa-1', { nombre: '', monto: 0 } as any);

      const saved = tarifaRepo.save.mock.calls[0][0];
      expect(saved.nombre).toBe('Original');
      expect(saved.monto).toBe(500);
    });
  });

  describe('remove', () => {
    it('soft-deletes the tarifa', async () => {
      tarifaRepo.softDelete.mockResolvedValue({ affected: 1 });
      await service.remove('tarifa-1');
      expect(tarifaRepo.softDelete).toHaveBeenCalledWith('tarifa-1');
    });
  });
});
