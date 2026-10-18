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
import { SelfGuard } from '../seguridad/jwt/self.guard';
import { StaffOrSelfGuard } from '../seguridad/jwt/staff.or.self.guard';
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

  @UseGuards(StaffOrSelfGuard)
  @Get(':id')
  @ApiDataResponse(UsuarioSinPasswordSchema, {
    description:
      'Usuario por id, con su domicilio y sin el hash de contraseña. Sólo el propio usuario, o personal con permiso SOCIOS en una organización a la que el usuario pertenece.',
  })
  @ApiErrorResponse(403, 'No puede consultar los datos de otro usuario.')
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

  @UseGuards(SelfGuard)
  @Patch(':id')
  @ApiErrorResponse(403, 'Sólo el propio usuario puede editar sus datos.')
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

  @UseGuards(SelfGuard)
  @Delete(':id')
  @ApiErrorResponse(403, 'Sólo el propio usuario puede dar de baja su cuenta.')
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
