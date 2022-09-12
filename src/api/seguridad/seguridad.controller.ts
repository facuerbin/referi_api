import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SeguridadService } from './seguridad.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Seguridad')
@Controller({ path: 'auth', version: '1' })
export class SeguridadController {
  constructor(private readonly seguridadService: SeguridadService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const user = await this.seguridadService.login(
      loginDto.email,
      loginDto.password,
    );
    return res.status(200).send({ data: user });
  }

  @Post('register')
  registerUser(@Body() user: RegisterDto) {
    return this.seguridadService.register(user);
  }

  // TODO Implentar
  @Post('recover')
  recuperarContrasenia() {
    return 'Recuperar contraseña';
  }
}
