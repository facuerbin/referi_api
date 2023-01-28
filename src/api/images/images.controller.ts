import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
  StreamableFile,
  Logger,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createReadStream, readFileSync, existsSync, unlink } from 'fs';
import path, { join } from 'path';
import { JwtAuthGuard } from '../seguridad/jwt/jwt.auth.guard';
import { FileUploadDto } from './dto/file.upload.dto';
import { saveImageOptions } from './helpers/save.image.helper';
import { ImagesService } from './images.service';
import type { Response } from 'express';
import { UsuariosService } from '../usuarios/usuarios.service';

@ApiBearerAuth()
@ApiTags('Imágenes')
@Controller({ path: 'uploads', version: '1' })
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private usuarioService: UsuariosService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen',
    type: FileUploadDto,
  })
  @Post('')
  @UseInterceptors(FileInterceptor('file', saveImageOptions))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 6 * 1024 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileName = file?.filename;
    if (!fileName) return { error: 'Invalid file type' };
    return file;
  }

  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen',
    type: FileUploadDto,
  })
  @Post('user')
  @UseInterceptors(FileInterceptor('file', saveImageOptions))
  uploadUserFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 6 * 1024 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req,
  ) {
    const fileName = file?.filename;
    if (!fileName) return { error: 'Invalid file type' };
    if (req.user.userId) {
      this.usuarioService.update(req.user.userId, {
        fotoPerfil: 'uploads/' + file.filename,
      });
    }
    return file;
  }

  @Get(':path')
  findImage(
    @Param('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'uploads', path));
    return new StreamableFile(file);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res) {
    if (
      (!id.includes('.jpg') && !id.includes('.png') && !id.includes('.jpeg')) ||
      id.includes('../')
    ) {
      return res.status(401).send({ error: 'Bad Request' });
    }
    try {
      const filePath = join(process.cwd(), id);
      if (!existsSync(filePath)) {
        return res.status(401).send({ error: 'File not found' });
      }
      unlink(filePath, (err) => {
        if (err) console.log(err);
        return err;
      });
      return res.status(200).send({ msg: 'Image deleted succesfully' });
    } catch (error) {
      return res.status(500).send({ error: 'Server error' });
    }
  }
}
