import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller({ path: 'usuarios', version: '1' })
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Res() res) {
    this.usuariosService
      .create(createUsuarioDto)
      .then((result) => {
        return res.status(200).send({ data: result });
      })
      .catch((error) => {
        return res.status(400).send({ error: error });
      });
  }

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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Res() res,
  ) {
    this.usuariosService
      .update(id, updateUsuarioDto)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ error: error }));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Res() res) {
    this.usuariosService
      .remove(id)
      .then((result) => res.status(200).send({ data: result }))
      .catch((error) => res.status(400).send({ data: error }));
  }
}
