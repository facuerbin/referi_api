import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { jwtConstants } from './jwt/constants';
import { JwtStrategy } from './jwt/jwt.strategy';
import { SeguridadController } from './seguridad.controller';
import { SeguridadService } from './seguridad.service';

@Module({
  controllers: [SeguridadController],
  providers: [SeguridadService, JwtStrategy],
  imports: [
    UsuariosModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '6h' },
    }),
  ],
})
export class SeguridadModule {}
