import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { LoadUserMiddleware } from 'src/middlewares/load.user';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [UsuariosModule, SeguridadModule],
})
export class ImagesModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(LoadUserMiddleware)
  //     .forRoutes({ path: '*', method: RequestMethod.POST });
  // }
}
