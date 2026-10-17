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

@ApiBearerAuth()
@ApiTags('Usuarios')
@Controller({ path: 'usuarios', version: '1' })
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
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
  remove(@Param('id') id: string, @Res() res) {
    this.usuariosService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ data: error }));
  }
}
