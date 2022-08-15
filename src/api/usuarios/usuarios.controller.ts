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
import { LoginDto } from './dto/login.dto';

@ApiTags('Usuarios')
@Controller({ path: 'usuarios', version: '1' })
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

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

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Res() res) {
    this.usuariosService
      .create(createUsuarioDto)
      .then((result) => {
        res.status(200).send({ data: result });
      })
      .catch((error) => {
        res.status(400).send({ error: error });
      });
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(+id);
  }
}
