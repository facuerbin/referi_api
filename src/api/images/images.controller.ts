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
  Req,
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
import { ApiErrorResponse } from '../../common/swagger/api-data-response.decorator';
import { createReadStream, existsSync, unlink } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from '../seguridad/jwt/jwt.auth.guard';
import { FileUploadDto } from './dto/file.upload.dto';
import { saveImageOptions } from './helpers/save.image.helper';
import type { Response } from 'express';
import { UsuariosService } from '../usuarios/usuarios.service';

@ApiBearerAuth()
@ApiTags('Imágenes')
@Controller({ path: 'uploads', version: '1' })
export class ImagesController {
  constructor(private usuarioService: UsuariosService) {}

  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen',
    type: FileUploadDto,
  })
  @Post('')
  @ApiResponse({
    status: 201,
    description:
      'Sólo almacena el archivo y responde el objeto de Multer (`filename`, `path`, `mimetype`, …). **No** actualiza el `fotoPerfil` del usuario: para eso usar `POST /uploads/user`. Responde `{ error }` si el tipo de archivo no es válido.',
  })
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
  @ApiResponse({
    status: 201,
    description:
      'Almacena el archivo y lo guarda como `fotoPerfil` del usuario autenticado (tomado del token, no del cuerpo). Responde el objeto de Multer; el valor persistido es `uploads/<filename>`.',
  })
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
  @ApiProduces('image/jpeg', 'image/png')
  @ApiResponse({
    status: 200,
    description:
      'Devuelve el archivo de imagen por nombre. Endpoint público: no requiere token.',
  })
  findImage(
    @Param('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const file = createReadStream(join(process.cwd(), 'uploads', path));
    return new StreamableFile(file);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Elimina una imagen del disco.',
    schema: { properties: { msg: { type: 'string' } } },
  })
  @ApiErrorResponse(
    401,
    'Nombre de archivo no permitido (sólo .jpg/.png/.jpeg, sin "../") o archivo inexistente.',
  )
  @ApiErrorResponse(500, 'Error del servidor al eliminar el archivo.')
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
        return err;
      });
      return res.status(200).send({ msg: 'Image deleted successfully' });
    } catch (error) {
      return res.status(500).send({ error: 'Server error' });
    }
  }
}
