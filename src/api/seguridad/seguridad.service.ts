import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as CacheManager from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { Cache } from 'cache-manager';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify.email.dto';
import {
  EmailService,
  validateCache as ValidateCache,
} from 'src/email/email.service';

@Injectable()
export class SeguridadService {
  constructor(
    private usersService: UsuariosService,
    private emailService: EmailService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheManager.Cache,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await compare(pass, user.password);
    if (!checkPassword) throw new HttpException('PASSWORD_INCORRECT', 403);

    const access_token = this.generateToken(user);
    return { user, access_token };
  }

  async register(user: RegisterDto) {
    const { password } = user;
    const hashPassword = await hash(password, 10);
    user = { ...user, password: hashPassword };
    const createdUser = await this.usersService.create(user);
    const access_token = this.generateToken(createdUser);
    return { ...createdUser, access_token };
  }

  async verifyEmail(verifyForm: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(verifyForm.email);
    if (user) {
      const status = await this.emailService.validateConfirmationNumber(
        user.id,
        '' + verifyForm.code,
      );
      user.verificado = status;
      this.usersService.verify(user);
      return { verified: status };
    }
    return { verified: false };
  }

  generateToken(user: Usuario) {
    const payload = { sub: user.id, iss: 'Referi' };
    return this.jwtService.sign(payload);
  }
}
