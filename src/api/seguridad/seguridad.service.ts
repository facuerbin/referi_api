import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class SeguridadService {
  constructor(
    private usersService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await compare(pass, user.password);
    if (!checkPassword) throw new HttpException('PASSWORD_INCORRECT', 403);

    const payload = { sub: user.id, iss: 'Referi' };
    const access_token = this.jwtService.sign(payload);
    return { user, access_token };
  }

  async register(user: RegisterDto) {
    const { password } = user;
    const hashPassword = await hash(password, 10);
    user = { ...user, password: hashPassword };
    return this.usersService.create(user);
  }
}
