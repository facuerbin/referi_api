import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '../seguridad/jwt/constants';
import { JwtStrategy } from '../seguridad/jwt/jwt.strategy';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Backup } from './entities/backup.entity';

@Module({
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy],
  imports: [
    UsuariosModule,
    SeguridadModule,
    TypeOrmModule.forFeature([Backup, Admin]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AdminModule {}
