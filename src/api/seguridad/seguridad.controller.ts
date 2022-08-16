import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SeguridadService } from './seguridad.service';

@ApiTags('Usuarios')
@Controller({ path: 'usuarios', version: '1' })
export class SeguridadController {
  constructor(private readonly seguridadService: SeguridadService) {}

  @Post('auth')
  login(@Body() loginDto: LoginDto) {
    return 'Login method';
  }

  @Get('auth')
  logout() {
    return 'Logged out';
  }

  @Post('auth/recover')
  recuperarContrasenia() {
    return 'Recuperar contraseña';
  }
}
