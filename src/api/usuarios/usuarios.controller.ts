import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UpdateUsuarioDto } from './dto/update.usuario.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../seguridad/jwt/jwt.auth.guard';
import { UsuarioResponseSchema } from './response/usuario.response.dto';
import { UsuarioSinPasswordSchema } from '../seguridad/response/auth.response.dto';
import {
  ApiDataResponse,
  ApiErrorResponse,
} from '../../common/swagger/api-data-response.decorator';

@ApiBearerAuth()
@ApiTags('Usuarios')
@Controller({ path: 'usuarios', version: '1' })
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiDataResponse(UsuarioSinPasswordSchema, {
    isArray: true,
    description: 'Lista de usuarios activos, sin el hash de contraseña.',
  })
  @ApiErrorResponse(400, 'Error al listar usuarios.')
  findAll(@Res() res) {
    this.usuariosService
      .findAll()
      .then((users) => {
        const result = users.map(({ password, ...properties }) => properties);
        return res.status(200).send({ data: result });
      })
      .catch((error) => {
        return res.status(400).send({ error: error });
      });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiDataResponse(UsuarioSinPasswordSchema, {
    description: 'Usuario por id, con su domicilio y sin el hash de contraseña.',
  })
  @ApiErrorResponse(401, 'Usuario inexistente o token inválido.')
  findOne(@Param('id') id: string, @Res() res) {
    this.usuariosService
      .findOne(id)
      .then((result) => {
        delete result.password;
        return res.status(200).send({ data: result });
      })
      .catch((error) => res.status(401).send({ error: error }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/email/:email')
  @ApiResponse({
    status: 200,
    description:
      'Usuario por email, sin el hash de contraseña. Responde sin envoltorio `data`, a diferencia del resto del módulo.',
    type: UsuarioSinPasswordSchema,
  })
  @ApiErrorResponse(401, 'Usuario inexistente o token inválido.')
  findByEmail(@Param('email') email: string, @Res() res) {
    this.usuariosService
      .findByEmail(email)
      .then((result) => {
        delete result.password;
        return res.status(200).send(result);
      })
      .catch((error) => res.status(401).send({ error: error }));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiResponse({
    status: 200,
    description:
      'Actualiza los datos del usuario y retorna el usuario completo (sin la contraseña, con su domicilio).',
    type: UsuarioResponseSchema,
  })
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Res() res,
  ) {
    this.usuariosService
      .update(id, updateUsuarioDto)
      .then((result) => {
        delete result.password;
        return res.status(200).send({ data: result });
      })
      .catch((error) => res.status(400).send({ error: error }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Da de baja al usuario (borrado lógico).',
    schema: { properties: { data: { type: 'object' } } },
  })
  remove(@Param('id') id: string, @Res() res) {
    this.usuariosService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ data: error }));
  }
}
