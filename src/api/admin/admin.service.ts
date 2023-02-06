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
    const user = await this.adminRepository.findOne({
      where: {
        email: email,
      },
    });
    const checkPassword = await compare(password, user.password);
    if (!user || !checkPassword) return 'UNAUTHORIZED';
    const payload = { sub: user.id, iss: 'Referi', role: 'admin' };
    return this.jwtService.sign(payload);
  }

  async listBackups() {
    const backups = await this.backupRepository.find({
      where: {
        fechaBaja: IsNull(),
      },
    });

    const oneMonth = 2628000000000; //ms
    backups.forEach(async (file) => {
      if (
        new Date(file.fechaCreacion).getTime() >=
        new Date().getTime() - oneMonth
      )
        return;
      await this.backupRepository.softDelete(file.id);
      console.log(file);
      try {
        const fileRoute = `./backups/${file.nombreArchivo}`;
        unlink(fileRoute, (err) => this.logger.error(err));
      } catch (e) {
        this.logger.log(e);
      }
    });

    return backups;
  }

  backup(scheduled: boolean) {
    const dbName = config.DB_NAME;
    const dbUser = config.DB_USER_NAME;
    const dbPassword = config.DB_USER_PASSWORD;
    const fileName = `${dbName}_${Date.now()}.sql`;
    const fileRoute = `./backups/${fileName}`;
    const cmd = `mysqldump -u ${dbUser} -p${dbPassword} --no-tablespaces ${dbName} > ${fileRoute}`;

    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        }
        const file = createReadStream(join(process.cwd(), fileRoute));
        this.backupRepository.save({
          nombreArchivo: fileName,
          programado: scheduled,
        });
        resolve(new StreamableFile(file));
      });
    });
  }

  restore(fileName: string) {
    const dbName = config.DB_NAME;
    const dbUser = config.DB_USER_NAME;
    const dbPassword = config.DB_USER_PASSWORD;

    if (fileName.includes('/')) return new Error('File name not supported');

    try {
      const fileRoute = readFileSync(
        join(process.cwd(), './backups/' + fileName),
      );
      const cmd = `mysqldump -u ${dbUser} -p${dbPassword} --no-tablespaces ${dbName} < ${fileRoute}`;
      return exec(cmd, (error, stdout, stderr) => {
        if (error) return error;
        return 'Database restored';
      });
    } catch (error) {
      this.logger.error(`File ${fileName} not found, restore failed.`);
    }
  }

  restoreFromFile(file: Express.Multer.File) {
    const dbName = config.DB_NAME;
    const dbUser = config.DB_USER_NAME;
    const dbPassword = config.DB_USER_PASSWORD;
    const fileName = file?.originalname;
    const filePath = join(process.cwd(), 'backups', fileName);
    writeFileSync(filePath, file.buffer, 'utf-8');
    const cmd = `mysql -u ${dbUser} -p${dbPassword} ${dbName} < ${filePath}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) return error;
    });
    return 'Database restored';
  }

  @Cron('0 0 6/12 * * *')
  async scheduledDbDump() {
    await this.backup(true);
    this.logger.log('Backup created succesfully.');
  }
}
