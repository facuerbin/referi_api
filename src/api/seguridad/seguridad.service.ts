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
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify.email.dto';
import {
  EmailService,
  validateCache as ValidateCache,
} from 'src/email/email.service';
import { RecoverPasswordDto } from './dto/recover.password.dto';
import { ChangePasswordDto } from './dto/change.password.dto';
import { RegisterFromOrgDto } from './dto/register.user.from.organization.dto';
import { SociosService } from '../socios/socios.service';

@Injectable()
export class SeguridadService {
  constructor(
    private usersService: UsuariosService,
    private emailService: EmailService,
    private sociosService: SociosService,
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

  async registerFromOrganization(dto: RegisterFromOrgDto) {
    const userExist = await this.usersService.findByEmail(dto.email);
    if (userExist) {
      return this.sociosService.create({
        idTurnoActividad: dto.idTurnoActividad,
        idUsuario: userExist.id,
      });
    }

    const password = this.generateRandomPassword();
    const newUser = await this.usersService.create({
      email: dto.email,
      password,
      nombre: dto.nombre,
      apellido: dto.apellido,
      dni: dto.dni,
      fechaNacimiento: dto.fechaNacimiento,
      telefono: dto.telefono,
      fotoPerfil: '',
      domicilio: {
        calle: dto.domicilio.calle,
        numero: dto.domicilio.numero,
        ciudad: dto.domicilio.ciudad,
        provincia: dto.domicilio.provincia,
      },
    });

    return this.sociosService.create({
      idTurnoActividad: dto.idTurnoActividad,
      idUsuario: newUser.id,
    });
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
    const user = await this.usersService.findByEmail(recover.email);
    if (!user.email) throw new Error('Invalid email');

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

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.usersService.findOne(dto.id);
    if (!user) throw new HttpException('USER_NOT_FOUND', 404);

    const checkPassword = await compare(dto.oldPassword, user.password);
    if (!checkPassword) throw new HttpException('PASSWORD_INCORRECT', 403);

    const newPassword = dto.newPassword;
    const hashed = await hash(newPassword, 10);
    user.password = hashed;
    return this.usersService.save(user);
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
