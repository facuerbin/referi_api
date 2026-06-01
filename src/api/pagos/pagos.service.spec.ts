import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { Cuota } from './entities/cuota.entity';
import { Pago } from './entities/pago.entity';
import { SociosService } from '../socios/socios.service';
import { TarifasService } from '../tarifas/tarifas.service';
import { MedioDePago } from './dto/registrar.pago.dto';

describe('PagosService', () => {
  let service: PagosService;
  let cuotaRepo: { find: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let pagoRepo: { find: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let tarifasService: jest.Mocked<TarifasService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Cuota),
          useValue: { find: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: { find: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: SociosService,
          useValue: { findByOrg: jest.fn(), findByUser: jest.fn() },
        },
        {
          provide: TarifasService,
          useValue: { findByActividad: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    cuotaRepo = module.get(getRepositoryToken(Cuota));
    pagoRepo = module.get(getRepositoryToken(Pago));
    tarifasService = module.get(TarifasService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('registrarPago', () => {
    const mockUser = { id: 'user-1', nombre: 'Juan' } as any;
    const mockOrg = { id: 'org-1' } as any;
    const mockCuotas = [
      { id: 'cuota-1', inscripcion: { usuario: mockUser, organizacion: mockOrg } },
      { id: 'cuota-2', inscripcion: { usuario: mockUser, organizacion: mockOrg } },
    ] as any;

    it('saves a payment with the user and organization from the first cuota', async () => {
      cuotaRepo.find.mockResolvedValue(mockCuotas);
      pagoRepo.save.mockResolvedValue({ id: 'pago-1' });

      await service.registrarPago({
        idsCuota: ['cuota-1', 'cuota-2'],
        medioDePago: MedioDePago.EFECTIVO,
        numeroDeComprobante: null,
      });

      expect(pagoRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ usuario: mockUser, organizacion: mockOrg, cuotas: mockCuotas }),
      );
    });

    it('sets numeroComprobante to null when not provided', async () => {
      cuotaRepo.find.mockResolvedValue(mockCuotas);
      pagoRepo.save.mockResolvedValue({});

      await service.registrarPago({ idsCuota: ['cuota-1'], medioDePago: MedioDePago.EFECTIVO, numeroDeComprobante: null });

      const saved = pagoRepo.save.mock.calls[0][0];
      expect(saved.numeroComprobante).toBeNull();
    });

    it('includes the comprobante number when provided', async () => {
      cuotaRepo.find.mockResolvedValue(mockCuotas);
      pagoRepo.save.mockResolvedValue({});

      await service.registrarPago({ idsCuota: ['cuota-1'], medioDePago: MedioDePago.EFECTIVO, numeroDeComprobante: '42' });

      const saved = pagoRepo.save.mock.calls[0][0];
      expect(saved.numeroComprobante).toBe('42');
    });

    it('records the payment date as now', async () => {
      cuotaRepo.find.mockResolvedValue(mockCuotas);
      pagoRepo.save.mockResolvedValue({});

      const before = Date.now();
      await service.registrarPago({ idsCuota: ['cuota-1'], medioDePago: MedioDePago.EFECTIVO, numeroDeComprobante: null });
      const after = Date.now();

      const saved = pagoRepo.save.mock.calls[0][0];
      expect(saved.fechaPago.getTime()).toBeGreaterThanOrEqual(before);
      expect(saved.fechaPago.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('createCuotas', () => {
    const makeInscripcion = (actividadId: string) => ({
      id: 'insc-1',
      turnoActividad: { actividad: { id: actividadId } },
    } as any);

    it('returns empty array when no tarifas exist for the actividad', async () => {
      tarifasService.findByActividad.mockResolvedValue([]);

      const result = await service.createCuotas(makeInscripcion('act-1'));
      expect(result).toEqual([]);
    });

    it('queries tarifas using the actividad id from the inscripcion', async () => {
      tarifasService.findByActividad.mockResolvedValue([]);

      await service.createCuotas(makeInscripcion('act-42'));

      expect(tarifasService.findByActividad).toHaveBeenCalledWith('act-42');
    });
  });
});
