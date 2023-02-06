import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [UsuariosModule, SeguridadModule],
})
export class ImagesModule {}
