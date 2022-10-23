import { CacheModule, Module } from '@nestjs/common';
import { UsuariosModule } from 'src/api/usuarios/usuarios.module';
import { EmailService } from 'src/email/email.service';

@Module({
  providers: [EmailService],
  imports: [UsuariosModule],
  exports: [EmailService],
})
export class EmailModule {}
