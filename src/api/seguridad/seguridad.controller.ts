import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SeguridadService } from './seguridad.service';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailDto } from './dto/verify.email.dto';

@ApiTags('Seguridad')
@Controller({ path: 'auth', version: '1' })
export class SeguridadController {
  constructor(
    private readonly seguridadService: SeguridadService,
    private emailService: EmailService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const data = await this.seguridadService.login(
      loginDto.email,
      loginDto.password,
    );
    return res.status(200).send({ data });
  }

  @Post('register')
  async registerUser(@Body() user: RegisterDto) {
    const createdUser = await this.seguridadService.register(user);
    this.emailService.sendConfirmationEmail(createdUser);
    return createdUser;
  }

  @Post('verify')
  verifyEmail(@Body() verification: VerifyEmailDto) {
    return this.seguridadService.verifyEmail(verification);
  }

  // TODO Implentar
  @Post('recover')
  recuperarContrasenia() {
    return 'Recuperar contraseña';
  }
}
