import {
  CACHE_MANAGER,
  HttpException,
  Inject,
  Injectable,
  Logger,
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
import { RecoverPasswordDto } from './dto/recover.password.dto';

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
    if (user && user.verificado) return { verified: true };
    if (user) {
      const status = await this.emailService.validateConfirmationNumber(
        user.id,
        '' + verifyForm.code,
      );
      if (!status) {
        this.emailService.sendConfirmationEmail(user);
        return { verified: false };
      }
      return { verified: status };
    }
    return { verified: false };
  }

  async checkVerified(id) {
    const user = await this.usersService.findOne(id);
    if (!user) return false;
    return user.verificado;
  }

  async recoverPassword(recover: RecoverPasswordDto) {
    const user = await this.usersService.findOne(recover.id);
    if (recover.email !== user.email) throw new Error('Invalid email');

    const newPassword = this.generateRandomPassword();
    const hashed = await hash(newPassword, 10);
    user.password = hashed;
    return this.usersService
      .save(user)
      .then((result) => {
        return this.emailService.sendRecoverPasswordEmail(result, newPassword);
      })
      .catch((e) => {
        Logger.error(e);
        return false;
      });
  }

  generateRandomPassword() {
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const string_length = 10;
    let password = '';
    for (let i = 0; i < string_length; i++) {
      const rand = Math.floor(Math.random() * chars.length);
      password += chars.substring(rand, rand + 1);
    }

    return password;
  }

  generateToken(user: Usuario) {
    const payload = { sub: user.id, iss: 'Referi' };
    return this.jwtService.sign(payload);
  }
}
