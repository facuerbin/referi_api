import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SeguridadService } from './seguridad.service';

@ApiTags('Seguridad')
@Controller({ path: 'auth', version: '1' })
export class SeguridadController {
  constructor(private readonly seguridadService: SeguridadService) {}

  @Post()
  login(@Body() loginDto: LoginDto) {
    return 'Login method';
  }

  @Get()
  logout() {
    return 'Logged out';
  }

  @Post('recover')
  recuperarContrasenia() {
    return 'Recuperar contraseña';
  }
}
