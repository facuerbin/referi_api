import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  StreamableFile,
  UseGuards,
  Body,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Backup } from './entities/backup.entity';
import { ApiErrorResponse } from '../../common/swagger/api-data-response.decorator';
import { createReadStream } from 'fs';
import { join } from 'path';
import { AdminService } from './admin.service';
import type { Response } from 'express';
import { FileUploadDto } from '../images/dto/file.upload.dto';
import { JwtAuthGuard } from '../seguridad/jwt/jwt.auth.guard';
import { LoginDto } from '../seguridad/dto/login.dto';

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiResponse({
    status: 201,
    description:
      'Login de administrador. Responde `{ access_token }` o la cadena `"UNAUTHORIZED"` si las credenciales no son válidas — conviene comprobar el cuerpo, no sólo el status.',
  })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`POST /login - Admin login attempt for ${loginDto.email}`);
    try {
      const result = await this.adminService.adminLogin(loginDto.email, loginDto.password);
      if (result === 'UNAUTHORIZED') {
        this.logger.warn(`POST /login - Unauthorized login for ${loginDto.email}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`POST /login - Error: ${error.message}`);
      throw error;
    }
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen',
    type: FileUploadDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('restore')
  @ApiResponse({
    status: 201,
    description:
      'Restaura la base de datos desde un archivo `.sql` subido (mime `application/sql`).',
  })
  @ApiErrorResponse(400, 'Tipo de archivo no soportado o restauración fallida.')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter(req, file, callback) {
        if (file.mimetype == 'application/sql') return callback(null, true);
        return callback(new Error('Mime type not supported'), false);
      },
    }),
  )
  restore(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 6 * 1024 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    this.logger.log(`POST /restore - Uploading backup file: ${file.originalname} (${file.size} bytes)`);
    try {
      const result = this.adminService.restoreFromFile(file);
      this.logger.log(`POST /restore - File upload and restore initiated`);
      return result;
    } catch (error) {
      this.logger.error(`POST /restore - Error: ${error.message}`);
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('backup')
  @ApiProduces('application/sql')
  @ApiResponse({
    status: 201,
    description:
      'Genera un backup manual y lo devuelve como descarga `.sql` (`attachment; filename="referi_<timestamp>.sql"`).',
  })
  async createBackup(@Res({ passthrough: true }) res: Response) {
    this.logger.log(`POST /backup - Starting manual database backup`);
    try {
      const backup = await this.adminService.backup(false);
      res.set({
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="referi_${Date.now()}.sql"`,
      });
      this.logger.log(`POST /backup - Backup created and ready for download`);
      return backup;
    } catch (error) {
      this.logger.error(`POST /backup - Error: ${error.message}`);
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('backups/:path')
  @ApiProduces('application/sql')
  @ApiResponse({
    status: 200,
    description: 'Descarga un backup existente por nombre de archivo.',
  })
  getBackup(
    @Param('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    this.logger.log(`GET /backups/:path - Downloading backup: ${path}`);
    try {
      const file = createReadStream(join(process.cwd(), 'backups', path));
      res.set({
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="${path}"`,
      });
      this.logger.log(`GET /backups/:path - Backup file ready for download: ${path}`);
      return new StreamableFile(file);
    } catch (error) {
      this.logger.error(`GET /backups/:path - Error reading backup: ${error.message}`);
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('backups')
  @ApiResponse({
    status: 200,
    description: 'Lista los backups registrados.',
    type: Backup,
    isArray: true,
  })
  getBackupsList() {
    this.logger.log(`GET /backups - Listing all backups`);
    try {
      const result = this.adminService.listBackups();
      this.logger.log(`GET /backups - Backups list retrieved`);
      return result;
    } catch (error) {
      this.logger.error(`GET /backups - Error: ${error.message}`);
      throw error;
    }
  }
}
