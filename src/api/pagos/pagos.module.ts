import { forwardRef, Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuota } from './entities/cuota.entity';
import { Pago } from './entities/pago.entity';
import { TarifasModule } from '../tarifas/tarifas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { SociosModule } from '../socios/socios.module';

@Module({
  controllers: [PagosController],
  providers: [PagosService],
  imports: [
    TypeOrmModule.forFeature([Cuota, Pago]),
    TarifasModule,
    UsuariosModule,
    forwardRef(() => SociosModule),
  ],
  exports: [PagosService],
})
export class PagosModule {}
