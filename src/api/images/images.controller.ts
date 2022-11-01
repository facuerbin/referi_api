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

@ApiBearerAuth()
@ApiTags('Imágenes')
@Controller({ path: 'uploads', version: '1' })
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

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
