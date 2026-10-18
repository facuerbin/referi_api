import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AsistenciasService } from './asistencias.service';
import { Asistente } from './entities/asistente.entity';
import { PlanillaAsistencia } from './entities/planilla.asistencia.entity';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { UsuariosService } from '../usuarios/usuarios.service';

describe('AsistenciasService', () => {
  let service: AsistenciasService;
  let asistenteRepo: { save: jest.Mock };
  let planillaRepo: { findOne: jest.Mock; save: jest.Mock; find: jest.Mock };
  let inscripcionRepo: { count: jest.Mock };
  let orgService: jest.Mocked<OrganizacionesService>;
  let usuariosService: jest.Mocked<UsuariosService>;

  const mockOrg = { id: 'org-1', nombre: 'Club Atlético' } as any;
  const mockPlanilla = {
    id: 'plan-1',
    fecha: new Date(),
    organizacion: mockOrg,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AsistenciasService,
        {
          provide: getRepositoryToken(Asistente),
          useValue: { save: jest.fn() },
        },
        {
          provide: getRepositoryToken(PlanillaAsistencia),
          useValue: { findOne: jest.fn(), save: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Inscripcion),
          useValue: { count: jest.fn() },
        },
        {
          provide: OrganizacionesService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: UsuariosService,
          useValue: { findOne: jest.fn(), findByEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AsistenciasService>(AsistenciasService);
    asistenteRepo = module.get(getRepositoryToken(Asistente));
    planillaRepo = module.get(getRepositoryToken(PlanillaAsistencia));
    inscripcionRepo = module.get(getRepositoryToken(Inscripcion));
    orgService = module.get(OrganizacionesService);
    usuariosService = module.get(UsuariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('registerAttendance', () => {
    it('saves an asistente linked to the day planilla', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);
      planillaRepo.findOne.mockResolvedValue(mockPlanilla);
      asistenteRepo.save.mockResolvedValue({ id: 'asist-1' });

      const dto = {
        idOrg: 'org-1',
        dni: '12345678',
        nombre: 'Ana',
        apellido: 'García',
      } as any;
      await service.registerAttendance(dto);

      expect(asistenteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          dni: '12345678',
          nombre: 'Ana',
          apellido: 'García',
          planilla: mockPlanilla,
        }),
      );
    });

    it('sets the attendance time to now', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);
      planillaRepo.findOne.mockResolvedValue(mockPlanilla);
      asistenteRepo.save.mockResolvedValue({});

      const before = Date.now();
      await service.registerAttendance({
        idOrg: 'org-1',
        dni: '1',
        nombre: 'A',
        apellido: 'B',
      } as any);
      const after = Date.now();

      const saved = asistenteRepo.save.mock.calls[0][0];
      expect(saved.hora.getTime()).toBeGreaterThanOrEqual(before);
      expect(saved.hora.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('registerAppAttendance', () => {
    const mockUsuario = {
      id: 'user-1',
      dni: 12345678,
      nombre: 'Ana',
      apellido: 'García',
    } as any;

    it('records attendance for a member of the organización', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);
      inscripcionRepo.count.mockResolvedValue(1);
      planillaRepo.findOne.mockResolvedValue(mockPlanilla);
      usuariosService.findOne.mockResolvedValue(mockUsuario);
      asistenteRepo.save.mockResolvedValue({ id: 'asist-1' });

      await service.registerAppAttendance('org-1', 'user-1');

      expect(asistenteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          idUsuario: 'user-1',
          planilla: mockPlanilla,
        }),
      );
    });

    it('refuses a user with no inscripción in that organización', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);
      inscripcionRepo.count.mockResolvedValue(0);

      await expect(
        service.registerAppAttendance('org-1', 'outsider'),
      ).rejects.toThrow(ForbiddenException);

      expect(asistenteRepo.save).not.toHaveBeenCalled();
    });

    it('scopes the membership check to the organización being scanned', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);
      inscripcionRepo.count.mockResolvedValue(1);
      planillaRepo.findOne.mockResolvedValue(mockPlanilla);
      usuariosService.findOne.mockResolvedValue(mockUsuario);
      asistenteRepo.save.mockResolvedValue({});

      await service.registerAppAttendance('org-1', 'user-1');

      expect(inscripcionRepo.count).toHaveBeenCalledWith({
        where: { usuario: { id: 'user-1' }, organizacion: { id: 'org-1' } },
      });
    });
  });

  describe('registerAttendanceWithEmail', () => {
    it('throws instead of dereferencing null when the email has no account', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);
      planillaRepo.findOne.mockResolvedValue(mockPlanilla);
      usuariosService.findByEmail.mockResolvedValue(null);

      await expect(
        service.registerAttendanceWithEmail({
          idOrg: 'org-1',
          emailUsuario: 'nobody@b.com',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPlanilla', () => {
    it('returns the existing planilla when one exists for today', async () => {
      planillaRepo.findOne.mockResolvedValue(mockPlanilla);

      const result = await service.getPlanilla(mockOrg);

      expect(result).toBe(mockPlanilla);
      expect(planillaRepo.save).not.toHaveBeenCalled();
    });

    it('creates and returns a new planilla when none exists for today', async () => {
      const newPlanilla = { id: 'plan-new' };
      planillaRepo.findOne.mockResolvedValue(null);
      planillaRepo.save.mockResolvedValue(newPlanilla);

      const result = await service.getPlanilla(mockOrg);

      expect(planillaRepo.save).toHaveBeenCalled();
      expect(result).toBe(newPlanilla);
    });

    it('uses midnight UTC as the planilla date', async () => {
      planillaRepo.findOne.mockResolvedValue(null);
      planillaRepo.save.mockResolvedValue({});

      await service.getPlanilla(mockOrg);

      const saved = planillaRepo.save.mock.calls[0][0];
      expect(saved.fecha.getUTCHours()).toBe(0);
      expect(saved.fecha.getUTCMinutes()).toBe(0);
      expect(saved.fecha.getUTCSeconds()).toBe(0);
    });
  });

  describe('getOrganizacion', () => {
    it('delegates to OrganizacionesService.findOne', async () => {
      orgService.findOne.mockResolvedValue(mockOrg);

      const result = await service.getOrganizacion('org-1');

      expect(orgService.findOne).toHaveBeenCalledWith('org-1');
      expect(result).toBe(mockOrg);
    });
  });
});
