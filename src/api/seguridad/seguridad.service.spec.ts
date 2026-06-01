import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { SeguridadService } from './seguridad.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { EmailService } from 'src/email/email.service';
import { SociosService } from '../socios/socios.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

import { hash, compare } from 'bcrypt';
const mockedCompare = compare as jest.MockedFunction<typeof compare>;
const mockedHash = hash as jest.MockedFunction<typeof hash>;

describe('SeguridadService', () => {
  let service: SeguridadService;
  let usersService: jest.Mocked<UsuariosService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = { id: 'user-1', password: 'hashed_password', verificado: false } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeguridadService,
        {
          provide: UsuariosService,
          useValue: {
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
            sendRecoverPasswordEmail: jest.fn(),
            validateConfirmationNumber: jest.fn(),
          },
        },
        {
          provide: SociosService,
          useValue: { create: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-1' }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SeguridadService>(SeguridadService);
    usersService = module.get(UsuariosService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('throws 404 when user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('a@b.com', 'pw')).rejects.toThrow(HttpException);
      await expect(service.login('a@b.com', 'pw')).rejects.toThrow('USER_NOT_FOUND');
    });

    it('throws 403 when password is incorrect', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(false as never);
      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow('PASSWORD_INCORRECT');
    });

    it('returns user and access_token on success', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(true as never);

      const result = await service.login('a@b.com', 'correct');

      expect(result.user).toBe(mockUser);
      expect(result.access_token).toBe('mock-token');
    });
  });

  describe('register', () => {
    it('hashes the password before persisting', async () => {
      usersService.create.mockResolvedValue(mockUser);
      await service.register({ email: 'a@b.com', password: 'plain' } as any);

      const savedArg = usersService.create.mock.calls[0][0];
      expect(savedArg.password).toBe('hashed_password');
      expect(savedArg.password).not.toBe('plain');
    });

    it('returns access_token in the result', async () => {
      usersService.create.mockResolvedValue(mockUser);
      const result = await service.register({ email: 'a@b.com', password: 'pw' } as any);
      expect(result.access_token).toBe('mock-token');
    });
  });

  describe('changePassword', () => {
    it('throws 404 when user is not found', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(
        service.changePassword({ id: 'x', oldPassword: 'a', newPassword: 'b' }),
      ).rejects.toThrow('USER_NOT_FOUND');
    });

    it('throws 403 when old password is incorrect', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      mockedCompare.mockResolvedValue(false as never);
      await expect(
        service.changePassword({ id: 'user-1', oldPassword: 'wrong', newPassword: 'new' }),
      ).rejects.toThrow('PASSWORD_INCORRECT');
    });

    it('saves user with newly hashed password on success', async () => {
      usersService.findOne.mockResolvedValue({ ...mockUser });
      mockedCompare.mockResolvedValue(true as never);
      usersService.save.mockResolvedValue(mockUser);

      await service.changePassword({ id: 'user-1', oldPassword: 'old', newPassword: 'new' });

      expect(mockedHash).toHaveBeenCalledWith('new', 10);
      expect(usersService.save).toHaveBeenCalled();
    });
  });

  describe('checkVerified', () => {
    it('returns false when user does not exist', async () => {
      usersService.findOne.mockResolvedValue(null);
      expect(await service.checkVerified('missing')).toBe(false);
    });

    it('returns the verificado value of the user', async () => {
      usersService.findOne.mockResolvedValue({ ...mockUser, verificado: true } as any);
      expect(await service.checkVerified('user-1')).toBe(true);

      usersService.findOne.mockResolvedValue({ ...mockUser, verificado: false } as any);
      expect(await service.checkVerified('user-1')).toBe(false);
    });
  });

  describe('generateRandomPassword', () => {
    it('returns a 10-character alphanumeric string', () => {
      const pwd = service.generateRandomPassword();
      expect(pwd).toHaveLength(10);
      expect(pwd).toMatch(/^[0-9A-Za-z]{10}$/);
    });

    it('does not return the same value every time', () => {
      const passwords = new Set(Array.from({ length: 20 }, () => service.generateRandomPassword()));
      expect(passwords.size).toBeGreaterThan(1);
    });
  });

  describe('generateToken', () => {
    it('signs a JWT with sub and iss payload', () => {
      service.generateToken({ id: 'user-abc' } as any);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-abc', iss: 'Referi' });
    });
  });

  describe('decodeToken', () => {
    it('delegates to jwtService.verify', () => {
      const result = service.decodeToken('some-token');
      expect(jwtService.verify).toHaveBeenCalledWith('some-token');
      expect(result).toEqual({ sub: 'user-1' });
    });
  });
});
