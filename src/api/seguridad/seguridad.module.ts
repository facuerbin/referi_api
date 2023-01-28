import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { SociosModule } from '../socios/socios.module';
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
    SociosModule,
    EmailModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  exports: [SeguridadService],
})
export class SeguridadModule {}
