import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

jest.mock('@sendgrid/mail', () => ({ setApiKey: jest.fn(), send: jest.fn() }));

import { EmailService, validateCache } from './email.service';
import { UsuariosService } from 'src/api/usuarios/usuarios.service';

describe('EmailService', () => {
  let service: EmailService;
  let cacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let usersService: jest.Mocked<UsuariosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: UsuariosService,
          useValue: { verifyEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    cacheManager = module.get(CACHE_MANAGER);
    usersService = module.get(UsuariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('generateConfirmationNumber', () => {
    it('returns a number between 0 and 9999', () => {
      const num = service.generateConfirmationNumber('user-1');
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(9999);
    });

    it('stores the number in cache with attempts set to 0', () => {
      const num = service.generateConfirmationNumber('user-1');
      expect(cacheManager.set).toHaveBeenCalledWith(
        'user-1',
        { number: num, attempts: 0 },
        300000,
      );
    });

    it('uses a TTL of 5 minutes (300000ms)', () => {
      service.generateConfirmationNumber('user-1');
      const [, , ttl] = cacheManager.set.mock.calls[0];
      expect(ttl).toBe(300000);
    });
  });

  describe('validateConfirmationNumber', () => {
    it('returns false when there is no cache entry', async () => {
      cacheManager.get.mockResolvedValue(null);
      expect(await service.validateConfirmationNumber('user-1', '1234')).toBe(false);
    });

    it('returns true and verifies the user email when the code matches', async () => {
      cacheManager.get.mockResolvedValue({ number: 1234, attempts: 0 } as validateCache);

      const result = await service.validateConfirmationNumber('user-1', '1234');

      expect(result).toBe(true);
      expect(usersService.verifyEmail).toHaveBeenCalledWith('user-1');
    });

    it('returns false and increments attempts when the code does not match', async () => {
      const cached: validateCache = { number: 1234, attempts: 0 };
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.validateConfirmationNumber('user-1', '9999');

      expect(result).toBe(false);
      expect(cacheManager.set).toHaveBeenCalledWith('user-1', { number: 1234, attempts: 1 });
    });

    it('keeps the entry in cache while attempts are within the 3-try limit', async () => {
      cacheManager.get.mockResolvedValue({ number: 1234, attempts: 2 } as validateCache);

      await service.validateConfirmationNumber('user-1', '9999');

      expect(cacheManager.set).toHaveBeenCalled();
      expect(cacheManager.del).not.toHaveBeenCalled();
    });

    it('deletes the cache entry after exceeding 3 failed attempts', async () => {
      cacheManager.get.mockResolvedValue({ number: 1234, attempts: 3 } as validateCache);

      await service.validateConfirmationNumber('user-1', '9999');

      expect(cacheManager.del).toHaveBeenCalledWith('user-1');
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });
});
