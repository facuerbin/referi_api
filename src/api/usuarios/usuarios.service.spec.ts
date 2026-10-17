import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { Domicilio } from './entities/domicilio.entity';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarioRepo: { findOne: jest.Mock; save: jest.Mock; find: jest.Mock; softDelete: jest.Mock };
  let domicilioRepo: { save: jest.Mock };

  const mockUser = {
    id: 'user-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@test.com',
    fotoPerfil: 'uploads/profile.jpeg',
    verificado: false,
    password: 'hashed',
    domicilio: { id: 'dom-1' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: { findOne: jest.fn(), save: jest.fn(), find: jest.fn(), softDelete: jest.fn() },
        },
        {
          provide: getRepositoryToken(Domicilio),
          useValue: { save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    usuarioRepo = module.get(getRepositoryToken(Usuario));
    domicilioRepo = module.get(getRepositoryToken(Domicilio));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const dto = {
      nombre: 'Ana', apellido: 'García', email: 'ana@test.com',
      password: 'hashed', dni: 12345678, telefono: '1234',
      fechaNacimiento: new Date('1990-01-01'),
      fotoPerfil: '',
      domicilio: { calle: 'Av. Siempre', numero: 123, ciudad: 'Rosario', provincia: 'Santa Fe' },
    } as any;

    it('saves the domicilio before the user', async () => {
      const savedDom = { id: 'dom-new', ...dto.domicilio };
      domicilioRepo.save.mockResolvedValue(savedDom);
      usuarioRepo.save.mockResolvedValue({ id: 'user-new' });

      await service.create(dto);

      expect(domicilioRepo.save).toHaveBeenCalledWith(dto.domicilio);
      expect(usuarioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ domicilio: savedDom }),
      );
    });

    it('uses the default profile photo when none is provided', async () => {
      domicilioRepo.save.mockResolvedValue({ id: 'dom-1' });
      usuarioRepo.save.mockResolvedValue({});

      await service.create({ ...dto, fotoPerfil: undefined });

      expect(usuarioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ fotoPerfil: 'uploads/profile.jpeg' }),
      );
    });

    it('uses the provided profile photo when given', async () => {
      domicilioRepo.save.mockResolvedValue({ id: 'dom-1' });
      usuarioRepo.save.mockResolvedValue({});

      await service.create({ ...dto, fotoPerfil: 'uploads/custom.jpg' });

      expect(usuarioRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ fotoPerfil: 'uploads/custom.jpg' }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('sets verificado to true and saves', async () => {
      usuarioRepo.findOne.mockResolvedValue({ ...mockUser });
      usuarioRepo.save.mockResolvedValue({ ...mockUser, verificado: true });

      await service.verifyEmail('user-1');

      const saved = usuarioRepo.save.mock.calls[0][0];
      expect(saved.verificado).toBe(true);
    });
  });

  describe('update', () => {
    it('updates allowed fields', async () => {
      usuarioRepo.findOne.mockResolvedValue({ ...mockUser });
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', { nombre: 'Carlos', telefono: '9999' });

      const saved = usuarioRepo.save.mock.calls[0][0];
      expect(saved.nombre).toBe('Carlos');
      expect(saved.telefono).toBe('9999');
    });

    it('does not update protected fields: id, fechaBaja, verificado, password, dni', async () => {
      const user = { ...mockUser, dni: 12345678 };
      usuarioRepo.findOne.mockResolvedValue(user);
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', {
        id: 'hacked-id',
        fechaBaja: new Date(),
        verificado: true,
        password: 'new-plain-password',
        dni: 123,
        nombre: 'Carlos',
      } as any);

      const saved = usuarioRepo.save.mock.calls[0][0];
      expect(saved.id).toBe('user-1');
      expect(saved.verificado).toBe(false);
      expect(saved.password).toBe('hashed');
      expect(saved.dni).toBe(12345678);
    });

    it('marks the account unverified when the email changes', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        ...mockUser,
        email: 'old@test.com',
        verificado: true,
      });
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', { email: 'new@test.com' } as any);

      const saved = usuarioRepo.save.mock.calls[0][0];
      expect(saved.email).toBe('new@test.com');
      expect(saved.verificado).toBe(false);
    });

    it('keeps the account verified when the email is unchanged', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        ...mockUser,
        email: 'same@test.com',
        verificado: true,
      });
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', {
        email: 'same@test.com',
        nombre: 'Carlos',
      } as any);

      const saved = usuarioRepo.save.mock.calls[0][0];
      expect(saved.verificado).toBe(true);
      expect(saved.nombre).toBe('Carlos');
    });

    it('loads the domicilio relation so the response is a complete user', async () => {
      usuarioRepo.findOne.mockResolvedValue({ ...mockUser });
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', { nombre: 'Carlos' });

      expect(usuarioRepo.findOne.mock.calls[0][0].relations).toEqual({
        domicilio: true,
      });
    });

    it('merges address fields into the existing domicilio row, keeping its id', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        ...mockUser,
        domicilio: { id: 'dom-1', calle: 'Vieja', numero: 1, ciudad: 'Rosario' },
      });
      domicilioRepo.save.mockImplementation((d) => Promise.resolve(d));
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', {
        domicilio: { calle: 'Nueva', numero: 42 },
      } as any);

      const savedDom = domicilioRepo.save.mock.calls[0][0];
      expect(savedDom.id).toBe('dom-1');
      expect(savedDom.calle).toBe('Nueva');
      expect(savedDom.numero).toBe(42);
      expect(savedDom.ciudad).toBe('Rosario');
    });

    it('ignores an incoming domicilio id so the write cannot be redirected', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        ...mockUser,
        domicilio: { id: 'dom-1', calle: 'Vieja', numero: 1 },
      });
      domicilioRepo.save.mockImplementation((d) => Promise.resolve(d));
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', {
        domicilio: { id: 'someone-elses-dom', calle: 'Nueva' },
      } as any);

      expect(domicilioRepo.save.mock.calls[0][0].id).toBe('dom-1');
    });

    it('creates a domicilio when the user has none', async () => {
      usuarioRepo.findOne.mockResolvedValue({ ...mockUser, domicilio: null });
      domicilioRepo.save.mockResolvedValue({ id: 'dom-new', calle: 'Nueva' });
      usuarioRepo.save.mockResolvedValue({});

      await service.update('user-1', {
        domicilio: { calle: 'Nueva', numero: 7 },
      } as any);

      expect(domicilioRepo.save.mock.calls[0][0].id).toBeUndefined();
      expect(usuarioRepo.save.mock.calls[0][0].domicilio).toEqual({
        id: 'dom-new',
        calle: 'Nueva',
      });
    });
  });

  describe('remove', () => {
    it('soft-deletes the user by id', async () => {
      usuarioRepo.softDelete.mockResolvedValue({ affected: 1 });
      await service.remove('user-1');
      expect(usuarioRepo.softDelete).toHaveBeenCalledWith('user-1');
    });
  });
});
