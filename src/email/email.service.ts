import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as sgMail from '@sendgrid/mail';
import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import { config } from 'src/config/config';
import * as CacheManager from 'cache-manager';
import { UsuariosService } from 'src/api/usuarios/usuarios.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: CacheManager.Cache,
    private userService: UsuariosService,
  ) {
    sgMail.setApiKey(config.MAIL_API_KEY);
  }

  sendConfirmationEmail(user: Usuario) {
    const rand = this.generateConfirmationNumber(user.id);

    if (config.SKIP_EMAIL) {
      this.logger.log(`[SKIP_EMAIL] Verification code for user ${user.id} (${user.email}): ${rand}`);
      return Promise.resolve(true);
    }

    const to = config.DEBUG_EMAIL
      ? config.DEBUG_EMAIL
      : `${user.nombre} ${user.apellido} <${user.email}>`;

    const content = `<h1>¡Bienvenido a Referí!</h1>
    Su código de verificación es ${rand}`;
    return sgMail
      .send({
        from: 'no-reply@referiapp.com.ar',
        to,
        subject: 'Código de confirmación - Referí',
        html: content,
      })
      .then(() => {
        this.logger.log('Email sent to user ' + user.id);
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed to send email to user ' + user.id);
        this.logger.error(error);
        return false;
      });
  }

  sendRecoverPasswordEmail(user: Usuario, password) {
    if (config.SKIP_EMAIL) {
      this.logger.log(`[SKIP_EMAIL] Recovery password for user ${user.id} (${user.email}): ${password}`);
      return Promise.resolve(true);
    }

    const to = config.DEBUG_EMAIL
      ? config.DEBUG_EMAIL
      : `${user.nombre} ${user.apellido} <${user.email}>`;

    const content = `<h1>¡Hola ${user.nombre}!</h1>
    <p>Acá está tu nueva contraseña.</p>
    <h3>Contraseña: <b>${password}</b></h3>
    <p>No compartas esta contraseña con nadie.</p>`;
    return sgMail
      .send({
        from: 'no-reply@referiapp.com.ar',
        to,
        subject: 'Nueva contraseña - Referí',
        html: content,
      })
      .then(() => {
        this.logger.log('Recovery email sent to user ' + user.id);
        return true;
      })
      .catch((error) => {
        this.logger.error('Failed to send recovery email to user ' + user.id);
        this.logger.error(error);
        return false;
      });
  }

  generateConfirmationNumber(userId: string) {
    const rand = Math.floor(Math.random() * 9999);
    this.cacheManager.set<validateCache>(
      userId,
      { number: rand, attempts: 0 },
      300000,
    );
    return rand;
  }

  async validateConfirmationNumber(userId: string, validationNumber: string) {
    const cached = await this.cacheManager.get<validateCache>(userId);
    if (!cached) {
      return false;
    }

    if ('' + cached.number === validationNumber) {
      this.userService.verifyEmail(userId);
      return true;
    }

    cached.attempts++;
    if (cached.attempts <= 3) {
      this.cacheManager.set<validateCache>(userId, cached);
    } else {
      this.cacheManager.del(userId);
    }
    return false;
  }
}

export interface validateCache {
  number: number;
  attempts: number;
}
