import { Controller, Post, Body, Res, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SeguridadService } from './seguridad.service';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailDto } from './dto/verify.email.dto';
import { RecoverPasswordDto } from './dto/recover.password.dto';
import { ChangePasswordDto } from './dto/change.password.dto';

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

  @Get('verify/:id')
  checkVerify(@Param('id') id: string, @Res() res) {
    this.seguridadService
      .checkVerified(id)
      .then((result) => {
        return res.status(200).send({ verified: result });
      })
      .catch((error) => {
        return res.status(400).send({ error: error });
      });
  }

  @Post('recover')
  recuperarContrasenia(@Body() recover: RecoverPasswordDto, @Res() res) {
    this.seguridadService
      .recoverPassword(recover)
      .then((result) => {
        if (result) {
          return res.status(200).send({ data: 'Password email sent' });
        } else {
          return res.status(401).send({ error: 'Invalid request' });
        }
      })
      .catch((error) => {
        return res.status(400).send({ error: error });
      });
  }

  @Post('change_password')
  cambiarContrasenia(@Body() dto: ChangePasswordDto, @Res() res) {
    this.seguridadService
      .changePassword(dto)
      .then((result) => {
        if (result) {
          return res.status(200).send({ data: 'Password updated' });
        } else {
          return res.status(401).send({ error: 'Invalid request' });
        }
      })
      .catch((error) => {
        return res.status(400).send({ error: error });
      });
  }

  @Get('logout')
  logout(@Body() recover: RecoverPasswordDto, @Res() res) {
    return 'Logout';
  }
}
