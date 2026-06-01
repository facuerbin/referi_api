import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActividadesService } from './actividades.service';
import { Actividad } from './entities/actividad.entity';
import { TipoActividad } from './entities/tipo.actividad.entity';
import { TurnoActividad } from './entities/turno.actividad.entity';
import { TurnoHorario } from './entities/turno.horario.entity';
import { EstadoActividad } from './entities/estado.actividad.entity';
import { Horario, Dias } from './entities/horario.entity';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';

describe('ActividadesService', () => {
  let service: ActividadesService;
  let horarioRepo: { findOne: jest.Mock; save: jest.Mock };
  let actividadRepo: { findOne: jest.Mock; save: jest.Mock; find: jest.Mock; softDelete: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActividadesService,
        {
          provide: getRepositoryToken(Actividad),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), softDelete: jest.fn() },
        },
        {
          provide: getRepositoryToken(TipoActividad),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(TurnoActividad),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(TurnoHorario),
          useValue: { save: jest.fn() },
        },
        {
          provide: getRepositoryToken(EstadoActividad),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(Horario),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: OrganizacionesService,
          useValue: { findOne: jest.fn(), findOneEspacio: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ActividadesService>(ActividadesService);
    horarioRepo = module.get(getRepositoryToken(Horario));
    actividadRepo = module.get(getRepositoryToken(Actividad));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findHorario', () => {
    const dia = Dias.LUNES;
    const hora = 9;
    const minutos = 0;
    const duracion = 60;

    it('returns an existing horario without creating a new one', async () => {
      const existing = { id: 'horario-1', diaSemana: dia, horaInicio: hora };
      horarioRepo.findOne.mockResolvedValue(existing);

      const result = await service.findHorario(dia, hora, minutos, duracion);

      expect(result).toBe(existing);
      expect(horarioRepo.save).not.toHaveBeenCalled();
    });

    it('creates and returns a new horario when none is found', async () => {
      const created = { id: 'horario-new', diaSemana: dia };
      horarioRepo.findOne.mockResolvedValue(null);
      horarioRepo.save.mockResolvedValue(created);

      const result = await service.findHorario(dia, hora, minutos, duracion);

      expect(horarioRepo.save).toHaveBeenCalledWith({ diaSemana: dia, horaInicio: hora, minutosInicio: minutos, duracion });
      expect(result).toBe(created);
    });

    it('queries with all four parameters', async () => {
      horarioRepo.findOne.mockResolvedValue(null);
      horarioRepo.save.mockResolvedValue({});

      await service.findHorario(Dias.MARTES, 18, 30, 90);

      expect(horarioRepo.findOne).toHaveBeenCalledWith({
        where: { diaSemana: Dias.MARTES, horaInicio: 18, minutosInicio: 30, duracion: 90 },
      });
    });
  });

  describe('ingresosPorActividad', () => {
    it('sums the monto of paid cuotas only', async () => {
      actividadRepo.findOne.mockResolvedValue({
        tarifas: [
          {
            cuotas: [
              { pago: { id: 'pago-1' }, monto: 500 },
              { pago: null, monto: 300 },
              { pago: { id: 'pago-2' }, monto: 200 },
            ],
          },
        ],
      });

      const result = await service.ingresosPorActividad('act-1');
      expect(result).toBe(700);
    });

    it('returns 0 when no cuotas have been paid', async () => {
      actividadRepo.findOne.mockResolvedValue({
        tarifas: [
          { cuotas: [{ pago: null, monto: 100 }, { pago: null, monto: 200 }] },
        ],
      });

      expect(await service.ingresosPorActividad('act-1')).toBe(0);
    });

    it('returns 0 when the activity has no tarifas', async () => {
      actividadRepo.findOne.mockResolvedValue({ tarifas: [] });
      expect(await service.ingresosPorActividad('act-1')).toBe(0);
    });
  });

  describe('deudaPorActividadPorOrganizacion', () => {
    it('sums unpaid and non-expired cuotas per actividad', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 10);
      const pastDate = new Date(Date.now() - 86400000);

      actividadRepo.find.mockResolvedValue([
        {
          nombre: 'Futbol',
          tarifas: [
            {
              cuotas: [
                { pago: null, monto: 200, fechaVencimiento: futureDate },
                { pago: { id: 'p1' }, monto: 300, fechaVencimiento: futureDate },
                { pago: null, monto: 100, fechaVencimiento: pastDate },
              ],
            },
          ],
        },
      ]);

      const result = await service.deudaPorActividadPorOrganizacion('org-1');
      expect(result['Futbol']).toBe(200);
    });
  });

  describe('remove', () => {
    it('soft-deletes the actividad by id', async () => {
      actividadRepo.softDelete.mockResolvedValue({ affected: 1 });
      await service.remove('act-1');
      expect(actividadRepo.softDelete).toHaveBeenCalledWith('act-1');
    });
  });
});
