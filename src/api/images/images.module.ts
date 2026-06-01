import { Module } from '@nestjs/common';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ImagesController } from './images.controller';

@Module({
  controllers: [ImagesController],
  imports: [UsuariosModule, SeguridadModule],
})
export class ImagesModule {}
