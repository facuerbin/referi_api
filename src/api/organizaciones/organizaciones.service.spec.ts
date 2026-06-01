import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizacionesService } from './organizaciones.service';
import { Organizacion } from './entities/organizacion.entity';
import { Espacio } from './entities/espacio.entity';
import { PersonalOrganizacion } from './entities/personal.organizacion.entity';
import { Rol } from './entities/rol.entity';
import { TipoOrganizacion } from './entities/tipo.organizacion.entity';
import { Domicilio } from '../usuarios/entities/domicilio.entity';
import { UsuariosService } from '../usuarios/usuarios.service';

describe('OrganizacionesService', () => {
  let service: OrganizacionesService;
  let orgRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock; softDelete: jest.Mock };
  let domicilioRepo: { save: jest.Mock };
  let tipoRepo: { findOne: jest.Mock; find: jest.Mock };
  let espacioRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock };
  let personalRepo: { findOne: jest.Mock; find: jest.Mock; save: jest.Mock; softDelete: jest.Mock };
  let rolRepo: { findOne: jest.Mock; find: jest.Mock };
  let usuariosService: jest.Mocked<UsuariosService>;

  const mockOrg = { id: 'org-1', nombre: 'Club Atlético', direccion: { id: 'dom-1' } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizacionesService,
        {
          provide: getRepositoryToken(Organizacion),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), softDelete: jest.fn() },
        },
        {
          provide: getRepositoryToken(Domicilio),
          useValue: { save: jest.fn() },
        },
        {
          provide: getRepositoryToken(TipoOrganizacion),
          useValue: { findOne: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Espacio),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(PersonalOrganizacion),
          useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn(), softDelete: jest.fn() },
        },
        {
          provide: getRepositoryToken(Rol),
          useValue: { findOne: jest.fn(), find: jest.fn() },
        },
        {
          provide: UsuariosService,
          useValue: { findByEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrganizacionesService>(OrganizacionesService);
    orgRepo = module.get(getRepositoryToken(Organizacion));
    domicilioRepo = module.get(getRepositoryToken(Domicilio));
    tipoRepo = module.get(getRepositoryToken(TipoOrganizacion));
    espacioRepo = module.get(getRepositoryToken(Espacio));
    personalRepo = module.get(getRepositoryToken(PersonalOrganizacion));
    rolRepo = module.get(getRepositoryToken(Rol));
    usuariosService = module.get(UsuariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('saves domicilio first, then saves the organization with it', async () => {
      const savedDom = { id: 'dom-new' };
      const mockTipo = { id: 'tipo-1', nombre: 'Deportivo' };
      domicilioRepo.save.mockResolvedValue(savedDom);
      tipoRepo.findOne.mockResolvedValue(mockTipo);
      orgRepo.save.mockResolvedValue(mockOrg);

      const dto = {
        nombre: 'Club', direccion: { calle: 'Av.', numero: 1, ciudad: 'BsAs', provincia: 'BsAs' },
        tipoOrganizacion: 'Deportivo', logo: '', descripcion: '', telefono: '', email: '',
      } as any;

      await service.create(dto);

      expect(domicilioRepo.save).toHaveBeenCalled();
      expect(orgRepo.save).toHaveBeenCalledWith(expect.objectContaining({ direccion: savedDom }));
    });
  });

  describe('createEspacio', () => {
    it('throws when the organization does not exist', async () => {
      orgRepo.findOne.mockResolvedValue(null);
      await expect(service.createEspacio('missing', { nombre: 'SUM', capacidad: 50 }))
        .rejects.toThrow('Organization not found');
    });

    it('saves the espacio linked to the organization', async () => {
      orgRepo.findOne.mockResolvedValue(mockOrg);
      espacioRepo.save.mockResolvedValue({ id: 'esp-1' });

      await service.createEspacio('org-1', { nombre: 'Cancha', capacidad: 100 });

      expect(espacioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Cancha', capacidad: 100, organizacion: mockOrg }),
      );
    });
  });

  describe('createPersonal', () => {
    it('updates the role of existing staff instead of creating a duplicate', async () => {
      const existing = { id: 'pers-1', rol: null };
      const mockUser = { id: 'user-1' };
      const mockRol = { id: 'rol-1', nombre: 'ENTRENADOR' };
      orgRepo.findOne.mockResolvedValue(mockOrg);
      usuariosService.findByEmail.mockResolvedValue(mockUser as any);
      rolRepo.findOne.mockResolvedValue(mockRol);
      personalRepo.findOne.mockResolvedValue(existing);
      personalRepo.save.mockResolvedValue({ ...existing, rol: mockRol });

      await service.createPersonal('org-1', { emailUsuario: 'a@b.com', rol: 'entrenador' });

      const saved = personalRepo.save.mock.calls[0][0];
      expect(saved.rol).toBe(mockRol);
    });

    it('creates a new staff record when none exists', async () => {
      const mockUser = { id: 'user-1' };
      const mockRol = { id: 'rol-1' };
      orgRepo.findOne.mockResolvedValue(mockOrg);
      usuariosService.findByEmail.mockResolvedValue(mockUser as any);
      rolRepo.findOne.mockResolvedValue(mockRol);
      personalRepo.findOne.mockResolvedValue(null);
      personalRepo.save.mockResolvedValue({ id: 'pers-new' });

      await service.createPersonal('org-1', { emailUsuario: 'a@b.com', rol: 'entrenador' });

      expect(personalRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ personal: mockUser, organizacion: mockOrg, rol: mockRol }),
      );
    });
  });

  describe('update', () => {
    it('updates allowed fields and merges the direccion', async () => {
      orgRepo.findOne.mockResolvedValue({ ...mockOrg });
      orgRepo.save.mockResolvedValue({});

      await service.update('org-1', {
        nombre: 'Nuevo Nombre',
        descripcion: 'Nueva descripción',
        direccion: { calle: 'Calle Nueva', numero: 99 },
      } as any);

      const saved = orgRepo.save.mock.calls[0][0];
      expect(saved.nombre).toBe('Nuevo Nombre');
      expect(saved.descripcion).toBe('Nueva descripción');
    });

    it('does not overwrite id or fechaBaja', async () => {
      orgRepo.findOne.mockResolvedValue({ ...mockOrg });
      orgRepo.save.mockResolvedValue({});

      await service.update('org-1', { id: 'hacked', fechaBaja: new Date(), nombre: 'X' } as any);

      const saved = orgRepo.save.mock.calls[0][0];
      expect(saved.id).toBe('org-1');
      expect(saved.fechaBaja).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('soft-deletes the organization', async () => {
      orgRepo.softDelete.mockResolvedValue({ affected: 1 });
      await service.remove('org-1');
      expect(orgRepo.softDelete).toHaveBeenCalledWith('org-1');
    });
  });
});
