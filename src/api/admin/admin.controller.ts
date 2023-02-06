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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.adminService.adminLogin(loginDto.email, loginDto.password);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen',
    type: FileUploadDto,
  })
  @UseGuards(JwtAuthGuard)
  @Post('restore')
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
    return this.adminService.restoreFromFile(file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('backup')
  async createBackup(@Res({ passthrough: true }) res: Response) {
    const backup = await this.adminService.backup(false);
    res.set({
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="referi_${Date.now()}.sql"`,
    });
    return backup;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('backups/:path')
  getBackup(
    @Param('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'backups', path));
    return new StreamableFile(file);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('backups')
  getBackupsList() {
    return this.adminService.listBackups();
  }
}
