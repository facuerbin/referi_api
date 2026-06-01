import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { Backup } from './entities/backup.entity';
import { Admin } from './entities/admin.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

import { compare } from 'bcrypt';
const mockedCompare = compare as jest.MockedFunction<typeof compare>;


describe('AdminService', () => {
  let service: AdminService;
  let backupRepo: { find: jest.Mock; save: jest.Mock; softDelete: jest.Mock };
  let adminRepo: { findOne: jest.Mock };
  let jwtService: jest.Mocked<JwtService>;

  const mockAdmin = { id: 'admin-1', email: 'admin@referi.com', password: 'hashed' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Backup),
          useValue: { find: jest.fn(), save: jest.fn(), softDelete: jest.fn() },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('admin-token') },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    backupRepo = module.get(getRepositoryToken(Backup));
    adminRepo = module.get(getRepositoryToken(Admin));
    jwtService = module.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('adminLogin', () => {
    it('returns UNAUTHORIZED when password is incorrect', async () => {
      adminRepo.findOne.mockResolvedValue(mockAdmin);
      mockedCompare.mockResolvedValue(false as never);

      const result = await service.adminLogin('admin@referi.com', 'wrong');
      expect(result).toBe('UNAUTHORIZED');
    });

    it('returns a signed JWT on successful login', async () => {
      adminRepo.findOne.mockResolvedValue(mockAdmin);
      mockedCompare.mockResolvedValue(true as never);

      const result = await service.adminLogin('admin@referi.com', 'correct');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'admin-1', role: 'admin', iss: 'Referi' }),
      );
      expect(result).toBe('admin-token');
    });
  });

  describe('listBackups', () => {
    it('returns the list of active backups', async () => {
      const now = new Date();
      const recentBackup = { id: 'b-1', fechaCreacion: now, nombreArchivo: 'backup.sql' };
      backupRepo.find.mockResolvedValue([recentBackup]);

      const result = await service.listBackups();
      expect(result).toEqual([recentBackup]);
    });

    it('soft-deletes backups older than one month', async () => {
      const old = new Date();
      old.setMonth(old.getMonth() - 2);
      const oldBackup = { id: 'b-old', fechaCreacion: old, nombreArchivo: 'old.sql' };
      backupRepo.find.mockResolvedValue([oldBackup]);
      backupRepo.softDelete.mockResolvedValue({ affected: 1 });

      await service.listBackups();

      expect(backupRepo.softDelete).toHaveBeenCalledWith('b-old');
    });

    it('does not soft-delete backups newer than one month', async () => {
      const recent = new Date();
      const recentBackup = { id: 'b-new', fechaCreacion: recent, nombreArchivo: 'new.sql' };
      backupRepo.find.mockResolvedValue([recentBackup]);

      await service.listBackups();

      expect(backupRepo.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('scheduledDbDump', () => {
    it('calls backup with scheduled=true and logs success', async () => {
      jest.spyOn(service, 'backup').mockResolvedValue(undefined);
      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

      await service.scheduledDbDump();

      expect(service.backup).toHaveBeenCalledWith(true);
      expect(Logger.prototype.log).toHaveBeenCalledWith('Backup created successfully.');
    });
  });
});
