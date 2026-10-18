import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { SeguridadService } from './seguridad.service';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailDto } from './dto/verify.email.dto';
import { RecoverPasswordDto } from './dto/recover.password.dto';
import { ChangePasswordDto } from './dto/change.password.dto';
import { RegisterFromOrgDto } from './dto/register.user.from.organization.dto';
import {
  LoginResponseSchema,
  RegisterResponseSchema,
} from './response/auth.response.dto';
import { Inscripcion } from '../socios/entities/inscripcion.entity';
import { ApiErrorResponse } from '../../common/swagger/api-data-response.decorator';
import { Public } from './jwt/public.decorator';

@ApiTags('Seguridad')
@Controller({ path: 'auth', version: '1' })
export class SeguridadController {
  constructor(
    private readonly seguridadService: SeguridadService,
    private emailService: EmailService,
  ) {}

  @Public()
  @Post('login')
  @ApiResponse({
    status: 200,
    description:
      'Autentica al usuario y retorna sus datos (sin la contraseña) junto al access_token.',
    type: LoginResponseSchema,
  })
  async login(@Body() loginDto: LoginDto, @Res() res) {
    const data = await this.seguridadService.login(
      loginDto.email,
      loginDto.password,
    );
    return res.status(200).send({ data });
  }

  @Public()
  @Post('register')
  @ApiResponse({
    status: 201,
    description:
      'Registra al usuario y retorna sus datos (sin la contraseña) junto al access_token.',
    type: RegisterResponseSchema,
  })
  async registerUser(@Body() user: RegisterDto) {
    const createdUser = await this.seguridadService.register(user);
    this.emailService.sendConfirmationEmail(createdUser);
    return createdUser;
  }

  @Public()
  @Post('verify')
  @ApiResponse({
    status: 201,
    description:
      'Valida el código enviado por email. Responde 2xx tanto para un código correcto como incorrecto: hay que leer `verified` para saber el resultado. Con un código incorrecto se reenvía un código nuevo.',
    schema: { properties: { verified: { type: 'boolean' } } },
  })
  verifyEmail(@Body() verification: VerifyEmailDto) {
    return this.seguridadService.verifyEmail(verification);
  }

  @Public()
  @Get('verify/:id')
  @ApiResponse({
    status: 200,
    description: 'Indica si la cuenta ya está verificada.',
    schema: { properties: { verified: { type: 'boolean' } } },
  })
  @ApiErrorResponse(400, 'Error al consultar el estado de verificación.')
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

  @Public()
  @Post('recover')
  @ApiResponse({
    status: 200,
    description:
      'Genera una contraseña nueva y la envía por email. Responde siempre `200` con `{ data: "Password email sent" }`, incluso si el email no tiene cuenta o si falla el envío: cualquier diferencia revelaría qué direcciones están registradas.',
    schema: { properties: { data: { type: 'string' } } },
  })
  recuperarContrasenia(@Body() recover: RecoverPasswordDto, @Res() res) {
    // Deliberately unconditional — see the Swagger description above.
    this.seguridadService
      .recoverPassword(recover)
      .catch((error) => Logger.error(error))
      .then(() => res.status(200).send({ data: 'Password email sent' }));
  }

  @ApiBearerAuth()
  @Post('socio')
  @ApiResponse({
    status: 200,
    description:
      'Inscribe a un usuario en un turno de actividad desde el panel de la organización, creando el usuario si el email no existe. Responde la inscripción sin envoltorio `data`.',
    type: Inscripcion,
  })
  @ApiErrorResponse(400, 'Turno inexistente o datos inválidos.')
  asociarNuevoUsuario(@Body() dto: RegisterFromOrgDto, @Res() res) {
    this.seguridadService
      .registerFromOrganization(dto)
      .then((result) => {
        return res.status(200).send({ ...result });
      })
      .catch((error) => {
        return res.status(400).send({ error: error.message });
      });
  }

  @ApiBearerAuth()
  @Post('change_password')
  @ApiResponse({
    status: 200,
    description:
      'Cambia la contraseña y responde `{ data: "Password updated" }`.',
    schema: { properties: { data: { type: 'string' } } },
  })
  @ApiErrorResponse(401, 'Contraseña actual incorrecta o usuario inexistente.')
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
}
