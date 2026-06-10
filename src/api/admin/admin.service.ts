import {
  Injectable,
  Logger,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Backup } from './entities/backup.entity';
import { Cron } from '@nestjs/schedule';
import { config } from 'src/config/config';
import { createReadStream, readFileSync, unlink, writeFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';
import { compare } from 'bcrypt';

@Injectable()
@UseInterceptors(FileInterceptor('file'))
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(
    @InjectRepository(Backup)
    private backupRepository: Repository<Backup>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {
    return null;
  }

  async adminLogin(email: string, password: string) {
    try {
      this.logger.log(`[ADMIN_LOGIN] Login attempt for ${email}`);
      const user = await this.adminRepository.findOne({
        where: {
          email: email,
        },
      });
      const checkPassword = await compare(password, user?.password || '');
      if (!user || !checkPassword) {
        this.logger.warn(`[ADMIN_LOGIN] Failed login attempt for ${email}`);
        return 'UNAUTHORIZED';
      }
      const payload = { sub: user.id, iss: 'Referi', role: 'admin' };
      const token = this.jwtService.sign(payload);
      this.logger.log(`[ADMIN_LOGIN] Successful login for ${email}`);
      return token;
    } catch (error) {
      this.logger.error(
        `[ADMIN_LOGIN] Error during login: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async listBackups() {
    try {
      this.logger.log(`[LIST_BACKUPS] Retrieving all active backups`);
      const backups = await this.backupRepository.find({
        where: {
          fechaBaja: IsNull(),
        },
      });

      this.logger.log(`[LIST_BACKUPS] Found ${backups.length} active backups`);

      const oneMonth = 2628000000; //ms
      let deletedCount = 0;
      backups.forEach(async (file) => {
        if (
          new Date(file.fechaCreacion).getTime() >=
          new Date().getTime() - oneMonth
        )
          return;
        this.logger.log(`[LIST_BACKUPS] Deleting old backup: ${file.nombreArchivo}`);
        await this.backupRepository.softDelete(file.id);
        deletedCount++;
        try {
          const fileRoute = `./backups/${file.nombreArchivo}`;
          unlink(fileRoute, (err) => {
            if (err) {
              this.logger.error(
                `[LIST_BACKUPS] Failed to delete file ${file.nombreArchivo}: ${err.message}`,
              );
            } else {
              this.logger.log(`[LIST_BACKUPS] Deleted old backup file: ${file.nombreArchivo}`);
            }
          });
        } catch (e) {
          this.logger.error(
            `[LIST_BACKUPS] Error deleting old backup: ${e.message}`,
            e.stack,
          );
        }
      });

      return backups;
    } catch (error) {
      this.logger.error(
        `[LIST_BACKUPS] Error listing backups: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  backup(scheduled: boolean) {
    const dbName = config.DB_NAME;
    const dbUser = config.DB_USER_NAME;
    const dbPassword = config.DB_USER_PASSWORD;
    const fileName = `${dbName}_${Date.now()}.sql`;
    const fileRoute = `./backups/${fileName}`;
    const cmd = `mysqldump -u ${dbUser} -p${dbPassword} --no-tablespaces ${dbName} > ${fileRoute}`;
    const startTime = Date.now();

    const label = scheduled ? '[SCHEDULED]' : '[MANUAL]';
    this.logger.log(`${label} Starting database backup to ${fileName}`);

    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(
            `${label} Backup command failed: ${error.message}`,
            error.stack,
          );
          reject(error);
          return;
        }
        try {
          const duration = Date.now() - startTime;
          const file = createReadStream(join(process.cwd(), fileRoute));
          this.backupRepository.save({
            nombreArchivo: fileName,
            programado: scheduled,
          }).catch(err => {
            this.logger.error(
              `${label} Failed to save backup record: ${err.message}`,
              err.stack,
            );
          });
          this.logger.log(`${label} Backup completed successfully (${duration}ms) - ${fileName}`);
          resolve(new StreamableFile(file));
        } catch (err) {
          this.logger.error(
            `${label} Error processing backup: ${err.message}`,
            err.stack,
          );
          reject(err);
        }
      });
    });
  }

  restore(fileName: string) {
    const dbName = config.DB_NAME;
    const dbUser = config.DB_USER_NAME;
    const dbPassword = config.DB_USER_PASSWORD;

    if (fileName.includes('/')) {
      this.logger.warn(`[RESTORE] Invalid file name (contains path): ${fileName}`);
      return new Error('File name not supported');
    }

    try {
      this.logger.log(`[RESTORE] Starting database restore from ${fileName}`);
      const startTime = Date.now();
      const fileRoute = readFileSync(
        join(process.cwd(), './backups/' + fileName),
      );
      const cmd = `mysql -u ${dbUser} -p${dbPassword} ${dbName} < ${fileRoute}`;
      return exec(cmd, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(
            `[RESTORE] Restore failed: ${error.message}`,
            error.stack,
          );
          return error;
        }
        const duration = Date.now() - startTime;
        this.logger.log(`[RESTORE] Database restored successfully from ${fileName} (${duration}ms)`);
        return 'Database restored';
      });
    } catch (error) {
      this.logger.error(
        `[RESTORE] File ${fileName} not found or error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  restoreFromFile(file: Express.Multer.File) {
    try {
      const dbName = config.DB_NAME;
      const dbUser = config.DB_USER_NAME;
      const dbPassword = config.DB_USER_PASSWORD;
      const fileName = file?.originalname;
      this.logger.log(`[RESTORE_FILE] Uploading and restoring from file: ${fileName}`);
      const startTime = Date.now();
      const filePath = join(process.cwd(), 'backups', fileName);
      writeFileSync(filePath, new Uint8Array(file.buffer));
      const cmd = `mysql -u ${dbUser} -p${dbPassword} ${dbName} < ${filePath}`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(
            `[RESTORE_FILE] Restore from file failed: ${error.message}`,
            error.stack,
          );
          return error;
        }
        const duration = Date.now() - startTime;
        this.logger.log(`[RESTORE_FILE] Database restored from file ${fileName} (${duration}ms)`);
      });
      return 'Database restored';
    } catch (error) {
      this.logger.error(
        `[RESTORE_FILE] Error processing file: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Cron('0 0 6/12 * * *')
  async scheduledDbDump() {
    try {
      this.logger.log('[SCHEDULER] Starting scheduled database backup (runs at 6 AM and 6 PM daily)');
      const startTime = Date.now();
      await this.backup(true);
      const duration = Date.now() - startTime;
      this.logger.log(`[SCHEDULER] Backup created successfully (${duration}ms)`);
    } catch (error) {
      this.logger.error(
        `[SCHEDULER] Scheduled backup failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
